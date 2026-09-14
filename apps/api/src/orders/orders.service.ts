import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreateOrderDto,
  OrderTypeDto,
} from './dto/create-order.dto';

import {
  OrderStatusDto,
} from './dto/update-order-status.dto';

import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    organizationId: string,
    branchId: string,
    createdById: string,
    dto: CreateOrderDto,
  ) {
    if (!dto.items?.length) {
      throw new BadRequestException(
        'Order must contain at least one item.',
      );
    }

    if (
      dto.orderType === OrderTypeDto.TAKEOUT &&
      dto.tableId
    ) {
      throw new BadRequestException(
        'Takeout orders cannot have a table.',
      );
    }

    const organization =
      await this.prisma.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          id: true,
          currency: true,
        },
      });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found.',
      );
    }

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

    if (dto.tableId) {
      if (dto.orderType !== OrderTypeDto.DINE_IN) {
        throw new BadRequestException(
          'A table can only be used for dine-in orders.',
        );
      }

      const table = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          organizationId,
          branchId,
          isActive: true,
        },
        select: {
          id: true,
          status: true,
          customerSelectable: true,
        },
      });

      if (!table) {
        throw new NotFoundException(
          'Table not found in this branch.',
        );
      }

      if (table.status === 'UNAVAILABLE') {
        throw new BadRequestException(
          'This table is currently unavailable.',
        );
      }
    }

    const productIds = [
      ...new Set(
        dto.items.map((item) => item.productId),
      ),
    ];

    const products =
      await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          organizationId,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      });

    if (products.length !== productIds.length) {
      throw new NotFoundException(
        'One or more products were not found or are inactive.',
      );
    }

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ]),
    );

    let subtotal = new Prisma.Decimal(0);

    const orderItems = dto.items.map((item) => {
      const product = productMap.get(
        item.productId,
      );

      if (!product) {
        throw new NotFoundException(
          'Product not found.',
        );
      }

      const unitPrice = new Prisma.Decimal(
        product.price,
      );

      const itemSubtotal =
        unitPrice.mul(item.quantity);

      subtotal = subtotal.add(itemSubtotal);

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const discount = new Prisma.Decimal(
      dto.discount ?? 0,
    );

    const tax = new Prisma.Decimal(
      dto.tax ?? 0,
    );

    if (discount.greaterThan(subtotal)) {
      throw new BadRequestException(
        'Discount cannot exceed the order subtotal.',
      );
    }

    const total = subtotal
      .sub(discount)
      .add(tax);

    if (total.lessThan(0)) {
      throw new BadRequestException(
        'Order total cannot be negative.',
      );
    }

    const orderNumber =
      await this.generateOrderNumber();

    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            organizationId,
            branchId,
            createdById,
            orderNumber,

            orderType: dto.orderType,
            tableId: dto.tableId ?? null,

            status: 'PENDING',
            paymentStatus: 'UNPAID',
            paymentMethod: null,

            currency: organization.currency,

            subtotal,
            discount,
            tax,
            total,

            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
          },
        });

        return order;
      },
    );
  }

  private async generateOrderNumber() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1,
    ).padStart(2, '0');
    const day = String(
      now.getDate(),
    ).padStart(2, '0');

    const prefix = `ORD-${year}${month}${day}`;

    const lastOrder =
      await this.prisma.order.findFirst({
        where: {
          orderNumber: {
            startsWith: prefix,
          },
        },
        orderBy: {
          orderNumber: 'desc',
        },
        select: {
          orderNumber: true,
        },
      });

    let sequence = 1;

    if (lastOrder) {
      const parts =
        lastOrder.orderNumber.split('-');

      const lastSequence =
        Number(parts[2]);

      if (!Number.isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  async findAll(
    organizationId: string,
    branchId: string,
  ) {
    return this.prisma.order.findMany({
      where: {
        organizationId,
        branchId,
      },
      include: {
        items: true,
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    organizationId: string,
    branchId: string,
    orderId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
        branchId,
      },
      include: {
        items: true,
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return order;
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    orderId: string,
    status: OrderStatusDto,
  ) {
    const order = await this.findOne(
      organizationId,
      branchId,
      orderId,
    );

    const currentStatus = order.status;

    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled orders cannot be updated.',
      );
    }

    if (currentStatus === 'COMPLETED') {
      throw new BadRequestException(
        'Completed orders cannot be updated.',
      );
    }

    if (status === currentStatus) {
      return order;
    }

    const allowedTransitions: Record<
      string,
      string[]
    > = {
      PENDING: [
        'CONFIRMED',
        'CANCELLED',
      ],

      CONFIRMED: [
        'PREPARING',
        'CANCELLED',
      ],

      PREPARING: [
        'READY',
      ],

      READY: [
        'COMPLETED',
      ],
    };

    const allowed =
      allowedTransitions[currentStatus] ?? [];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from ${currentStatus} to ${status}.`,
      );
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        items: true,
      },
    });
  }

  async recordPayment(
    organizationId: string,
    branchId: string,
    orderId: string,
    createdById: string,
    dto: RecordPaymentDto,
  ) {
    const order = await this.findOne(
      organizationId,
      branchId,
      orderId,
    );

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException(
        'Order is already paid.',
      );
    }

    if (order.paymentStatus === 'REFUNDED') {
      throw new BadRequestException(
        'Refunded orders cannot receive payments.',
      );
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled orders cannot receive payments.',
      );
    }

    const total = new Prisma.Decimal(order.total);

    const amountReceived = new Prisma.Decimal(
      dto.amountReceived,
    );

    if (amountReceived.lessThan(total)) {
      throw new BadRequestException(
        'Payment amount is less than the order total.',
      );
    }

    if (
      dto.paymentMethod !== 'CASH' &&
      !amountReceived.equals(total)
    ) {
      throw new BadRequestException(
        'Non-cash payments must equal the order total.',
      );
    }

    const amount = total;

    const changeAmount =
      dto.paymentMethod === 'CASH'
        ? amountReceived.minus(amount)
        : new Prisma.Decimal(0);

    return this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId,
            organizationId,
            branchId,
            createdById,

            method: dto.paymentMethod,
            amount,
            amountReceived,
            changeAmount,
            currency: order.currency,
          },
        });

        const updatedOrder =
          await tx.order.update({
            where: {
              id: orderId,
            },
            data: {
              paymentStatus: 'PAID',
              paymentMethod: dto.paymentMethod,
            },
            include: {
              items: true,
              payments: true,
            },
          });

        return {
          order: updatedOrder,
          payment,
        };
      },
    );
  }

}