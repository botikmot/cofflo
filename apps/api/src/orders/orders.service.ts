import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateOrderDto, OrderTypeDto } from './dto/create-order.dto';

import { OrderStatusDto } from './dto/update-order-status.dto';

import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreatePublicOrderDto } from '../public/dto/create-public-order.dto';
import { TableSessionsService } from '../table-sessions/table-sessions.service';

import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tableSessionsService: TableSessionsService,
  ) {}

  private getTodayRange(timezone: string) {
    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

    const year = Number(parts.find((part) => part.type === 'year')?.value);

    const month = Number(parts.find((part) => part.type === 'month')?.value);

    const day = Number(parts.find((part) => part.type === 'day')?.value);

    const start = this.zonedDateTimeToUtc(year, month, day, timezone);

    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

    const nextParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(nextDay);

    const nextYear = Number(
      nextParts.find((part) => part.type === 'year')?.value,
    );

    const nextMonth = Number(
      nextParts.find((part) => part.type === 'month')?.value,
    );

    const nextDayValue = Number(
      nextParts.find((part) => part.type === 'day')?.value,
    );

    const end = this.zonedDateTimeToUtc(
      nextYear,
      nextMonth,
      nextDayValue,
      timezone,
    );

    return {
      start,
      end,
    };
  }

  private zonedDateTimeToUtc(
    year: number,
    month: number,
    day: number,
    timezone: string,
  ) {
    const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(guess);

    const get = (type: string) =>
      Number(formatted.find((part) => part.type === type)?.value);

    const localAsUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second'),
    );

    const offset = localAsUtc - guess.getTime();

    return new Date(guess.getTime() - offset);
  }

  private async createOrder(input: {
    organizationId: string;
    branchId: string;
    createdById: string | null;
    source: 'STAFF' | 'CUSTOMER';
    publicToken: string | null;
    orderType: OrderTypeDto;
    tableId?: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    discount: number;
    tax: number;
    notes?: string;
  }) {
    if (!input.items?.length) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    if (input.orderType === OrderTypeDto.TAKEOUT && input.tableId) {
      throw new BadRequestException('Takeout orders cannot have a table.');
    }

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: input.organizationId,
      },
      select: {
        id: true,
        currency: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: input.branchId,
        organizationId: input.organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization.');
    }

    if (input.tableId) {
      if (input.orderType !== OrderTypeDto.DINE_IN) {
        throw new BadRequestException(
          'A table can only be used for dine-in orders.',
        );
      }

      const table = await this.prisma.table.findFirst({
        where: {
          id: input.tableId,
          organizationId: input.organizationId,
          branchId: input.branchId,
          isActive: true,
        },
        select: {
          id: true,
          status: true,
          customerSelectable: true,
        },
      });

      if (!table) {
        throw new NotFoundException('Table not found in this branch.');
      }

      if (table.status === 'UNAVAILABLE') {
        throw new BadRequestException('This table is currently unavailable.');
      }

      if (input.source === 'CUSTOMER' && !table.customerSelectable) {
        throw new BadRequestException(
          'This table is not available for customer ordering.',
        );
      }
    }

    const productIds = [...new Set(input.items.map((item) => item.productId))];

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        organizationId: input.organizationId,
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
      products.map((product) => [product.id, product]),
    );

    let subtotal = new Prisma.Decimal(0);

    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      const unitPrice = new Prisma.Decimal(product.price);

      const itemSubtotal = unitPrice.mul(item.quantity);

      subtotal = subtotal.add(itemSubtotal);

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const discount = new Prisma.Decimal(input.discount);

    const tax = new Prisma.Decimal(input.tax);

    if (discount.greaterThan(subtotal)) {
      throw new BadRequestException(
        'Discount cannot exceed the order subtotal.',
      );
    }

    const total = subtotal.sub(discount).add(tax);

    if (total.lessThan(0)) {
      throw new BadRequestException('Order total cannot be negative.');
    }

    const orderNumber = await this.generateOrderNumber();

    return this.prisma.$transaction(async (tx) => {
      let tableSessionId: string | null = null;

      if (input.orderType === OrderTypeDto.DINE_IN && input.tableId) {
        const session =
          await this.tableSessionsService.ensureOpenSessionInTransaction(
            tx,
            input.organizationId,
            input.branchId,
            input.tableId,
          );

        tableSessionId = session.id;
      }

      return tx.order.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          createdById: input.createdById,

          publicToken: input.publicToken,

          source: input.source,

          orderNumber,

          orderType: input.orderType,

          tableId: input.tableId ?? null,
          tableSessionId,

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
          table: true,
          tableSession: true,
        },
      });
    });
  }

  async create(
    organizationId: string,
    branchId: string,
    createdById: string,
    dto: CreateOrderDto,
  ) {
    return this.createOrder({
      organizationId,
      branchId,
      createdById,
      source: 'STAFF',
      publicToken: null,
      orderType: dto.orderType,
      tableId: dto.tableId,
      items: dto.items,
      discount: dto.discount ?? 0,
      tax: dto.tax ?? 0,
      notes: dto.notes,
    });
  }

  async createPublic(
    organizationId: string,
    branchId: string,
    dto: CreatePublicOrderDto,
  ) {
    const publicToken = randomBytes(24).toString('base64url');

    const isQrOrder = Boolean(dto.qrToken);

    /*
     * Start with a table selected by the customer.
     * For QR orders, this will be replaced by the QR table.
     */
    let tableId: string | undefined = dto.tableId;

    /*
     * QR ORDER
     *
     * The QR token is the source of truth for the table.
     */
    if (dto.qrToken) {
      const table = await this.prisma.table.findFirst({
        where: {
          qrToken: dto.qrToken,
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
          'The table QR code is invalid or does not belong to this branch.',
        );
      }

      if (!table.customerSelectable) {
        throw new BadRequestException(
          'This table is not available for customer ordering.',
        );
      }

      if (table.status === 'UNAVAILABLE') {
        throw new BadRequestException('This table is currently unavailable.');
      }

      tableId = table.id;
    }

    /*
     * DINE-IN MUST HAVE A TABLE
     *
     * Normal public Dine-in:
     * customer selects the table manually.
     *
     * QR Dine-in:
     * table comes from the QR code.
     */
    if (dto.orderType === OrderTypeDto.DINE_IN && !tableId) {
      throw new BadRequestException(
        'Please select a table for dine-in orders.',
      );
    }

    /*
     * TABLE VALIDATION
     */
    if (tableId) {
      if (dto.orderType !== OrderTypeDto.DINE_IN) {
        throw new BadRequestException(
          'A table can only be used for dine-in orders.',
        );
      }

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
          customerSelectable: true,
        },
      });

      if (!table) {
        throw new NotFoundException('Table not found in this branch.');
      }

      if (!table.customerSelectable) {
        throw new BadRequestException(
          'This table is not available for customer ordering.',
        );
      }

      /*
       * Manually selected tables must still be AVAILABLE.
       *
       * QR tables are allowed to be already occupied because
       * the customer is ordering for the table they are already at.
       */
      if (!isQrOrder && table.status !== 'AVAILABLE') {
        throw new BadRequestException('This table is no longer available.');
      }

      if (isQrOrder && table.status === 'UNAVAILABLE') {
        throw new BadRequestException('This table is currently unavailable.');
      }
    }

    return this.createOrder({
      organizationId,
      branchId,
      createdById: null,
      source: 'CUSTOMER',
      publicToken,
      orderType: dto.orderType,
      tableId,
      items: dto.items,
      discount: 0,
      tax: 0,
      notes: dto.notes,
    });
  }

  private async generateOrderNumber() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const prefix = `ORD-${year}${month}${day}`;

    const lastOrder = await this.prisma.order.findFirst({
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
      const parts = lastOrder.orderNumber.split('-');

      const lastSequence = Number(parts[2]);

      if (!Number.isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  async findAll(
    organizationId: string,
    branchId: string,
    page = 1,
    limit = 20,
    status?: OrderStatusDto,
    search?: string,
  ) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
      select: {
        timezone: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const safePage = Math.max(1, page);

    const safeLimit = Math.min(Math.max(1, limit), 50);

    const skip = (safePage - 1) * safeLimit;

    const todayRange = this.getTodayRange(branch.timezone);

    const where: Prisma.OrderWhereInput = {
      organizationId,
      branchId,

      createdAt: {
        gte: todayRange.start,
        lt: todayRange.end,
      },

      ...(status
        ? {
            status,
          }
        : {}),

      ...(search?.trim()
        ? {
            OR: [
              {
                orderNumber: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                table: {
                  name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,

        include: {
          items: true,

          table: true,

          tableSession: {
            select: {
              id: true,
              status: true,
              openedAt: true,
              closedAt: true,
            },
          },
        },

        orderBy: [
          {
            createdAt: 'asc',
          },
        ],

        skip,
        take: safeLimit,
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    return {
      data: orders,

      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(organizationId: string, branchId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
        branchId,
      },
      include: {
        items: true,
        table: true,
        tableSession: {
          select: {
            id: true,
            status: true,
            openedAt: true,
            closedAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    orderId: string,
    status: OrderStatusDto,
  ) {
    const order = await this.findOne(organizationId, branchId, orderId);

    const currentStatus = order.status;

    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException('Cancelled orders cannot be updated.');
    }

    if (currentStatus === 'COMPLETED') {
      throw new BadRequestException('Completed orders cannot be updated.');
    }

    if (status === currentStatus) {
      return order;
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],

      CONFIRMED: ['PREPARING', 'CANCELLED'],

      PREPARING: ['READY'],

      READY: ['COMPLETED'],
    };

    const allowed = allowedTransitions[currentStatus] ?? [];

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
        table: true,
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
    const order = await this.findOne(organizationId, branchId, orderId);

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid.');
    }

    if (order.paymentStatus === 'REFUNDED') {
      throw new BadRequestException('Refunded orders cannot receive payments.');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled orders cannot receive payments.',
      );
    }

    const total = new Prisma.Decimal(order.total);

    const amountReceived = new Prisma.Decimal(dto.amountReceived);

    if (amountReceived.lessThan(total)) {
      throw new BadRequestException(
        'Payment amount is less than the order total.',
      );
    }

    if (dto.paymentMethod !== 'CASH' && !amountReceived.equals(total)) {
      throw new BadRequestException(
        'Non-cash payments must equal the order total.',
      );
    }

    const amount = total;

    const changeAmount =
      dto.paymentMethod === 'CASH'
        ? amountReceived.minus(amount)
        : new Prisma.Decimal(0);

    return this.prisma.$transaction(async (tx) => {
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

      const updatedOrder = await tx.order.update({
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
    });
  }
}
