import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import {
  CreateInventoryMovementDto,
  InventoryMovementTypeDto,
} from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createItem(
    organizationId: string,
    branchId: string,
    userId: string,
    dto: CreateInventoryItemDto,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    const existingItem =
      await this.prisma.inventoryItem.findFirst({
        where: {
          branchId,
          name: dto.name,
        },
        select: {
          id: true,
        },
      });

    if (existingItem) {
      throw new ConflictException(
        'An inventory item with this name already exists in this branch.',
      );
    }

    if (dto.sku) {
      const existingSku =
        await this.prisma.inventoryItem.findFirst({
          where: {
            branchId,
            sku: dto.sku,
          },
          select: {
            id: true,
          },
        });

      if (existingSku) {
        throw new ConflictException(
          'An inventory item with this SKU already exists in this branch.',
        );
      }
    }

    const initialStock = dto.initialStock ?? 0;

    return this.prisma.$transaction(
      async (tx) => {
        const item =
          await tx.inventoryItem.create({
            data: {
              organizationId,
              branchId,
              name: dto.name,
              sku: dto.sku,
              unit: dto.unit,
              minimumStock:
                dto.minimumStock ?? 0,
              currentStock: initialStock,
            },
          });

        if (initialStock > 0) {
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: item.id,
              organizationId,
              branchId,
              createdById: userId,
              type: 'IN',
              quantity: initialStock,
              reason: 'Initial stock',
            },
          });
        }

        return item;
      },
    );
  }

  async findAll(
    organizationId: string,
    branchId: string,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    return this.prisma.inventoryItem.findMany({
      where: {
        organizationId,
        branchId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    const item =
      await this.prisma.inventoryItem.findFirst({
        where: {
          id: inventoryItemId,
          organizationId,
          branchId,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Inventory item not found.',
      );
    }

    return item;
  }

  async updateItem(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
    dto: UpdateInventoryItemDto,
  ) {
    await this.findOne(
      organizationId,
      branchId,
      inventoryItemId,
    );

    if (dto.sku) {
      const existingSku =
        await this.prisma.inventoryItem.findFirst({
          where: {
            branchId,
            sku: dto.sku,
            NOT: {
              id: inventoryItemId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingSku) {
        throw new ConflictException(
          'An inventory item with this SKU already exists in this branch.',
        );
      }
    }

    return this.prisma.inventoryItem.update({
      where: {
        id: inventoryItemId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.sku !== undefined && {
          sku: dto.sku,
        }),
        ...(dto.unit !== undefined && {
          unit: dto.unit,
        }),
        ...(dto.minimumStock !== undefined && {
          minimumStock: dto.minimumStock,
        }),
      },
    });
  }

  async archiveItem(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    await this.findOne(
      organizationId,
      branchId,
      inventoryItemId,
    );

    return this.prisma.inventoryItem.update({
      where: {
        id: inventoryItemId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async createMovement(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
    userId: string,
    dto: CreateInventoryMovementDto,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    if (
      dto.type !== InventoryMovementTypeDto.ADJUSTMENT &&
      dto.quantity <= 0
    ) {
      throw new BadRequestException(
        'Quantity must be greater than zero.',
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const item =
          await tx.inventoryItem.findFirst({
            where: {
              id: inventoryItemId,
              organizationId,
              branchId,
              isActive: true,
            },
          });

        if (!item) {
          throw new NotFoundException(
            'Inventory item not found.',
          );
        }

        const currentStock =
          new Prisma.Decimal(item.currentStock);

        let stockChange: Prisma.Decimal;

        switch (dto.type) {
          case InventoryMovementTypeDto.IN:
            stockChange = new Prisma.Decimal(
              dto.quantity,
            );
            break;

          case InventoryMovementTypeDto.OUT:
          case InventoryMovementTypeDto.WASTE:
            stockChange = new Prisma.Decimal(
              dto.quantity,
            ).negated();
            break;

          case InventoryMovementTypeDto.ADJUSTMENT:
            stockChange = new Prisma.Decimal(
              dto.quantity,
            );
            break;
        }

        const newStock =
          currentStock.plus(stockChange);

        if (newStock.lessThan(0)) {
          throw new BadRequestException(
            'Insufficient stock.',
          );
        }

        const updatedItem =
          await tx.inventoryItem.update({
            where: {
              id: inventoryItemId,
            },
            data: {
              currentStock: newStock,
            },
          });

        const movement =
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId,
              organizationId,
              branchId,
              createdById: userId,
              type: dto.type,
              quantity:
                dto.type ===
                  InventoryMovementTypeDto.OUT ||
                dto.type ===
                  InventoryMovementTypeDto.WASTE
                  ? new Prisma.Decimal(
                      dto.quantity,
                    ).negated()
                  : dto.quantity,
              reason: dto.reason,
              reference: dto.reference,
            },
          });

        return {
          item: updatedItem,
          movement,
        };
      },
    );

    return result;
  }

  async getMovements(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    await this.findOne(
      organizationId,
      branchId,
      inventoryItemId,
    );

    return this.prisma.inventoryMovement.findMany({
      where: {
        organizationId,
        branchId,
        inventoryItemId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async validateBranch(
    organizationId: string,
    branchId: string,
  ) {
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
      throw new NotFoundException(
        'Branch not found in this organization.',
      );
    }

    return branch;
  }

  async findLowStock(
    organizationId: string,
    branchId: string,
  ) {
    await this.validateBranch(
      organizationId,
      branchId,
    );

    const items =
      await this.prisma.inventoryItem.findMany({
        where: {
          organizationId,
          branchId,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

    return items.filter((item) =>
      item.currentStock.lessThanOrEqualTo(
        item.minimumStock,
      ),
    );
  }

}