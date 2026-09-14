import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import {
  UpdateTableStatusDto,
} from './dto/update-table-status.dto';

@Injectable()
export class TablesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    organizationId: string,
    branchId: string,
    dto: CreateTableDto,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    const existingTable =
      await this.prisma.table.findFirst({
        where: {
          branchId,
          name: dto.name,
        },
        select: {
          id: true,
        },
      });

    if (existingTable) {
      throw new ConflictException(
        'A table with this name already exists in this branch.',
      );
    }

    const qrToken = this.generateQrToken();

    return this.prisma.table.create({
      data: {
        organizationId,
        branchId,

        name: dto.name,
        capacity: dto.capacity,
        location: dto.location,
        photoUrl: dto.photoUrl,
        customerSelectable:
          dto.customerSelectable ?? true,

        qrToken,
        status: 'AVAILABLE',
        isActive: true,
      },
    });
  }

  async findAll(
    organizationId: string,
    branchId: string,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    return this.prisma.table.findMany({
      where: {
        organizationId,
        branchId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(
    organizationId: string,
    branchId: string,
    tableId: string,
  ) {
    const table =
      await this.prisma.table.findFirst({
        where: {
          id: tableId,
          organizationId,
          branchId,
        },
      });

    if (!table) {
      throw new NotFoundException(
        'Table not found.',
      );
    }

    return table;
  }

  async update(
    organizationId: string,
    branchId: string,
    tableId: string,
    dto: UpdateTableDto,
  ) {
    await this.findOne(
      organizationId,
      branchId,
      tableId,
    );

    if (dto.name) {
      const existingTable =
        await this.prisma.table.findFirst({
          where: {
            branchId,
            name: dto.name,
            NOT: {
              id: tableId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingTable) {
        throw new ConflictException(
          'A table with this name already exists in this branch.',
        );
      }
    }

    return this.prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.capacity !== undefined && {
          capacity: dto.capacity,
        }),
        ...(dto.location !== undefined && {
          location: dto.location,
        }),
        ...(dto.photoUrl !== undefined && {
          photoUrl: dto.photoUrl,
        }),
        ...(dto.customerSelectable !==
          undefined && {
          customerSelectable:
            dto.customerSelectable,
        }),
      },
    });
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    tableId: string,
    dto: UpdateTableStatusDto,
  ) {
    const table = await this.findOne(
      organizationId,
      branchId,
      tableId,
    );

    if (!table.isActive) {
      throw new ConflictException(
        'Archived tables cannot change status.',
      );
    }

    return this.prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        status: dto.status,
      },
    });
  }

  async archive(
    organizationId: string,
    branchId: string,
    tableId: string,
  ) {
    await this.findOne(
      organizationId,
      branchId,
      tableId,
    );

    return this.prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        isActive: false,
        status: 'UNAVAILABLE',
      },
    });
  }

  private async validateBranch(
    organizationId: string,
    branchId: string,
  ) {
    const branch =
      await this.prisma.branch.findFirst({
        where: {
          id: branchId,
          organizationId,
        },
        select: {
          id: true,
        },
      });

    if (!branch) {
      throw new NotFoundException(
        'Branch not found in this organization.',
      );
    }

    return branch;
  }

  private generateQrToken() {
    return randomBytes(18).toString('base64url');
  }
}