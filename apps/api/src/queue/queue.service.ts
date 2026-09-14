import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AssignQueueTableDto } from './dto/assign-queue-table.dto';
import { JoinQueueDto } from './dto/join-queue.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async joinQueue(organizationId: string, branchId: string, dto: JoinQueueDto) {
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

    const now = new Date();

    const publicToken = randomBytes(24).toString('base64url');

    const queueDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const lastEntry = await this.prisma.queueEntry.findFirst({
      where: {
        branchId,
        queueDate,
      },
      orderBy: {
        queueNumber: 'desc',
      },
      select: {
        queueNumber: true,
      },
    });

    const queueNumber = (lastEntry?.queueNumber ?? 0) + 1;

    return this.prisma.queueEntry.create({
      data: {
        organizationId,
        branchId,

        publicToken,

        queueDate,
        queueNumber,

        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        guestCount: dto.guestCount,

        status: 'WAITING',
        notes: dto.notes,
      },
    });
  }

  async getTodayQueue(organizationId: string, branchId: string) {
    const queueDate = this.getTodayQueueDate();

    return this.prisma.queueEntry.findMany({
      where: {
        organizationId,
        branchId,
        queueDate,
        status: {
          in: ['WAITING', 'CALLED', 'SEATED'],
        },
      },
      include: {
        table: true,
      },
      orderBy: [
        {
          queueNumber: 'asc',
        },
      ],
    });
  }

  async getPosition(
    organizationId: string,
    branchId: string,
    queueEntryId: string,
  ) {
    const queueDate = this.getTodayQueueDate();

    const entry = await this.prisma.queueEntry.findFirst({
      where: {
        id: queueEntryId,
        organizationId,
        branchId,
        queueDate,
      },
    });

    if (!entry) {
      throw new NotFoundException('Queue entry not found.');
    }

    if (entry.status !== 'WAITING') {
      return {
        queueNumber: entry.queueNumber,
        status: entry.status,
        position: null,
      };
    }

    const aheadCount = await this.prisma.queueEntry.count({
      where: {
        branchId,
        queueDate,
        status: 'WAITING',
        joinedAt: {
          lt: entry.joinedAt,
        },
      },
    });

    return {
      queueNumber: entry.queueNumber,
      status: entry.status,
      position: aheadCount + 1,
    };
  }

  async callNext(
    organizationId: string,
    branchId: string,
    dto: AssignQueueTableDto,
  ) {
    const queueDate = this.getTodayQueueDate();

    const table = await this.prisma.table.findFirst({
      where: {
        id: dto.tableId,
        organizationId,
        branchId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        status: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in this branch.');
    }

    if (table.status !== 'AVAILABLE') {
      throw new ConflictException('This table is not currently available.');
    }

    const waitingEntries = await this.prisma.queueEntry.findMany({
      where: {
        branchId,
        queueDate,
        status: 'WAITING',
        guestCount: {
          lte: table.capacity,
        },
      },
      orderBy: [
        {
          joinedAt: 'asc',
        },
        {
          queueNumber: 'asc',
        },
      ],
      take: 1,
    });

    const nextEntry = waitingEntries[0];

    if (!nextEntry) {
      throw new NotFoundException(
        'No suitable customer is currently waiting for this table.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const queueEntry = await tx.queueEntry.update({
        where: {
          id: nextEntry.id,
        },
        data: {
          tableId: table.id,
          status: 'CALLED',
          calledAt: new Date(),
        },
        include: {
          table: true,
        },
      });

      await tx.table.update({
        where: {
          id: table.id,
        },
        data: {
          status: 'RESERVED',
        },
      });

      return queueEntry;
    });
  }

  async markSeated(
    organizationId: string,
    branchId: string,
    queueEntryId: string,
  ) {
    const entry = await this.prisma.queueEntry.findFirst({
      where: {
        id: queueEntryId,
        organizationId,
        branchId,
      },
      include: {
        table: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Queue entry not found.');
    }

    if (entry.status !== 'CALLED') {
      throw new BadRequestException(
        'Only called queue entries can be marked as seated.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.queueEntry.update({
        where: {
          id: queueEntryId,
        },
        data: {
          status: 'SEATED',
          seatedAt: new Date(),
        },
      });

      if (entry.tableId) {
        await tx.table.update({
          where: {
            id: entry.tableId,
          },
          data: {
            status: 'OCCUPIED',
          },
        });
      }

      return tx.queueEntry.findUnique({
        where: {
          id: queueEntryId,
        },
        include: {
          table: true,
        },
      });
    });
  }

  async cancel(organizationId: string, branchId: string, queueEntryId: string) {
    const entry = await this.prisma.queueEntry.findFirst({
      where: {
        id: queueEntryId,
        organizationId,
        branchId,
      },
    });

    if (!entry) {
      throw new NotFoundException('Queue entry not found.');
    }

    if (entry.status === 'SEATED' || entry.status === 'CANCELLED') {
      throw new BadRequestException('This queue entry cannot be cancelled.');
    }

    return this.prisma.queueEntry.update({
      where: {
        id: queueEntryId,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  private getTodayQueueDate() {
    const now = new Date();

    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  async releaseTable(
    organizationId: string,
    branchId: string,
    tableId: string,
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
        status: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in this branch.');
    }

    if (table.status !== 'OCCUPIED') {
      throw new BadRequestException('Only occupied tables can be released.');
    }

    return this.prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        status: 'AVAILABLE',
      },
    });
  }

  async getNextForTable(
    organizationId: string,
    branchId: string,
    tableId: string,
  ) {
    const queueDate = this.getTodayQueueDate();

    const table = await this.prisma.table.findFirst({
      where: {
        id: tableId,
        organizationId,
        branchId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        status: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in this branch.');
    }

    if (table.status !== 'AVAILABLE') {
      throw new ConflictException('This table is not currently available.');
    }

    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: {
        branchId,
        queueDate,
        status: 'WAITING',
        guestCount: {
          lte: table.capacity,
        },
      },
      orderBy: [
        {
          joinedAt: 'asc',
        },
        {
          queueNumber: 'asc',
        },
      ],
      include: {
        table: true,
      },
    });

    return {
      table,
      nextCustomer: nextEntry,
    };
  }

  async getQueueSummary(organizationId: string, branchId: string) {
    const queueDate = this.getTodayQueueDate();

    const entries = await this.prisma.queueEntry.findMany({
      where: {
        organizationId,
        branchId,
        queueDate,
      },
      select: {
        status: true,
      },
    });

    const waiting = entries.filter(
      (entry) => entry.status === 'WAITING',
    ).length;

    const called = entries.filter((entry) => entry.status === 'CALLED').length;

    const seated = entries.filter((entry) => entry.status === 'SEATED').length;

    return {
      total: entries.length,
      waiting,
      called,
      seated,
    };
  }
}
