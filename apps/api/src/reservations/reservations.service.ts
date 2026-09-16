import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  ReservationStatusDto,
  UpdateReservationStatusDto,
} from './dto/update-reservation-status.dto';
import { randomBytes } from 'crypto';
import { TableSessionsService } from '../table-sessions/table-sessions.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tableSessionsService: TableSessionsService,
  ) {}

  async create(
    organizationId: string,
    branchId: string,
    dto: CreateReservationDto,
  ) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    const publicToken = randomBytes(24).toString('base64url');

    this.validateDateRange(startAt, endAt);

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization.');
    }

    let assignedTableId = dto.tableId ?? null;

    if (dto.tableId) {
      await this.validateRequestedTable(
        organizationId,
        branchId,
        dto.tableId,
        dto.guestCount,
      );

      await this.ensureTableAvailable(branchId, dto.tableId, startAt, endAt);

      const table = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          organizationId,
          branchId,
          isActive: true,
        },
        select: {
          status: true,
        },
      });

      const now = new Date();

      if (table?.status === 'OCCUPIED' && startAt <= now && endAt > now) {
        throw new ConflictException(
          'This table is currently occupied during the requested time.',
        );
      }
    } else {
      const availableTables = await this.findAvailableTables(
        organizationId,
        branchId,
        startAt,
        endAt,
        dto.guestCount,
      );

      if (!availableTables.length) {
        throw new ConflictException(
          'No suitable table is available for the selected time.',
        );
      }

      assignedTableId = availableTables[0].id;
    }

    return this.prisma.reservation.create({
      data: {
        organizationId,
        branchId,
        tableId: assignedTableId,

        publicToken,

        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        guestCount: dto.guestCount,

        startAt,
        endAt,

        status: 'PENDING',
        notes: dto.notes,
      },

      include: {
        table: true,
      },
    });
  }

  async findAll(organizationId: string, branchId: string) {
    return this.prisma.reservation.findMany({
      where: {
        organizationId,
        branchId,
      },
      include: {
        table: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    });
  }

  async findOne(
    organizationId: string,
    branchId: string,
    reservationId: string,
  ) {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: reservationId,
        organizationId,
        branchId,
      },
      include: {
        table: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    return reservation;
  }

  async update(
    organizationId: string,
    branchId: string,
    reservationId: string,
    dto: UpdateReservationDto,
  ) {
    const existing = await this.findOne(
      organizationId,
      branchId,
      reservationId,
    );

    if (
      existing.status === 'CANCELLED' ||
      existing.status === 'COMPLETED' ||
      existing.status === 'NO_SHOW'
    ) {
      throw new ConflictException('This reservation can no longer be updated.');
    }

    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;

    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;

    this.validateDateRange(startAt, endAt);

    const guestCount = dto.guestCount ?? existing.guestCount;

    const tableId = dto.tableId !== undefined ? dto.tableId : existing.tableId;

    if (tableId) {
      await this.validateRequestedTable(
        organizationId,
        branchId,
        tableId,
        guestCount,
      );

      await this.ensureTableAvailable(
        branchId,
        tableId,
        startAt,
        endAt,
        reservationId,
      );
    }

    return this.prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        ...(dto.tableId !== undefined && {
          tableId: dto.tableId,
        }),

        ...(dto.customerName !== undefined && {
          customerName: dto.customerName,
        }),

        ...(dto.customerPhone !== undefined && {
          customerPhone: dto.customerPhone,
        }),

        ...(dto.guestCount !== undefined && {
          guestCount: dto.guestCount,
        }),

        ...(dto.startAt !== undefined && {
          startAt,
        }),

        ...(dto.endAt !== undefined && {
          endAt,
        }),

        ...(dto.notes !== undefined && {
          notes: dto.notes,
        }),
      },

      include: {
        table: true,
      },
    });
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    reservationId: string,
    dto: UpdateReservationStatusDto,
  ) {
    const reservation = await this.findOne(
      organizationId,
      branchId,
      reservationId,
    );

    this.validateStatusTransition(reservation.status, dto.status);

    // All non-SEATED transitions keep the existing simple flow.
    if (dto.status !== 'SEATED') {
      return this.prisma.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status: dto.status,
        },
        include: {
          table: true,
        },
      });
    }

    // A reservation must have a table before it can be seated.
    if (!reservation.tableId) {
      throw new ConflictException('This reservation has no assigned table.');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const table = await tx.table.findFirst({
          where: {
            id: reservation.tableId!,
            organizationId,
            branchId,
            isActive: true,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!table) {
          throw new NotFoundException('Assigned table not found.');
        }

        if (table.status === 'UNAVAILABLE') {
          throw new ConflictException('The assigned table is unavailable.');
        }

        // A reservation being seated should not take over
        // an already occupied table/session.
        if (table.status === 'OCCUPIED') {
          throw new ConflictException(
            'The assigned table is currently occupied.',
          );
        }

        const session =
          await this.tableSessionsService.ensureOpenSessionInTransaction(
            tx,
            organizationId,
            branchId,
            table.id,
          );

        const updatedReservation = await tx.reservation.update({
          where: {
            id: reservationId,
          },
          data: {
            status: 'SEATED',
            tableId: table.id,
          },
          include: {
            table: true,
          },
        });

        return {
          ...updatedReservation,
          tableSessionId: session.id,
        };
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  private validateDateRange(startAt: Date, endAt: Date) {
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Invalid reservation date or time.');
    }

    if (startAt >= endAt) {
      throw new BadRequestException(
        'Reservation end time must be after the start time.',
      );
    }
  }

  private async validateRequestedTable(
    organizationId: string,
    branchId: string,
    tableId: string,
    guestCount: number,
  ) {
    const table = await this.prisma.table.findFirst({
      where: {
        id: tableId,
        organizationId,
        branchId,
        isActive: true,
      },
      select: {
        id: true,
        capacity: true,
        status: true,
        customerSelectable: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in this branch.');
    }

    if (!table.customerSelectable) {
      throw new BadRequestException(
        'This table is not available for customer selection.',
      );
    }

    if (table.status === 'UNAVAILABLE') {
      throw new BadRequestException('This table is currently unavailable.');
    }

    if (table.capacity < guestCount) {
      throw new BadRequestException(
        `This table can only accommodate ${table.capacity} guests.`,
      );
    }

    return table;
  }

  private async ensureTableAvailable(
    branchId: string,
    tableId: string,
    startAt: Date,
    endAt: Date,
    excludeReservationId?: string,
  ) {
    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        branchId,
        tableId,

        status: {
          in: ['PENDING', 'CONFIRMED', 'SEATED'],
        },

        startAt: {
          lt: endAt,
        },

        endAt: {
          gt: startAt,
        },

        ...(excludeReservationId && {
          id: {
            not: excludeReservationId,
          },
        }),
      },

      select: {
        id: true,
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'This table is already reserved during the selected time.',
      );
    }
  }

  private validateStatusTransition(
    current: string,
    next: ReservationStatusDto,
  ) {
    if (current === next) {
      return;
    }

    const allowed: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],

      CONFIRMED: ['SEATED', 'CANCELLED', 'NO_SHOW'],

      SEATED: ['COMPLETED'],

      CANCELLED: ['PENDING'],

      NO_SHOW: ['PENDING'],

      COMPLETED: [],
    };

    const nextStatuses = allowed[current] ?? [];

    if (!nextStatuses.includes(next)) {
      throw new BadRequestException(
        `Cannot change reservation status from ${current} to ${next}.`,
      );
    }
  }

  async findAvailableTables(
    organizationId: string,
    branchId: string,
    startAt: Date,
    endAt: Date,
    guestCount: number,
  ) {
    this.validateDateRange(startAt, endAt);

    const tables = await this.prisma.table.findMany({
      where: {
        organizationId,
        branchId,
        isActive: true,
        customerSelectable: true,
        capacity: {
          gte: guestCount,
        },
        status: {
          not: 'UNAVAILABLE',
        },
      },
      orderBy: [
        {
          capacity: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    const availableTables = [];

    for (const table of tables) {
      const overlapping = await this.prisma.reservation.findFirst({
        where: {
          branchId,
          tableId: table.id,

          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED'],
          },

          startAt: {
            lt: endAt,
          },

          endAt: {
            gt: startAt,
          },
        },

        select: {
          id: true,
        },
      });

      if (!overlapping) {
        availableTables.push(table);
      }
    }

    return availableTables;
  }
}
