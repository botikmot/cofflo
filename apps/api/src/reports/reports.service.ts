import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type ReportFilters = {
  branchId?: string;
  from: string;
  to: string;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(from: string, to: string) {
    const startAt = new Date(`${from}T00:00:00.000Z`);
    const endAt = new Date(`${to}T23:59:59.999Z`);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Invalid report date range.');
    }

    if (startAt > endAt) {
      throw new BadRequestException(
        'Report start date cannot be after the end date.',
      );
    }

    return {
      startAt,
      endAt,
    };
  }

  private getDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  async getReport(organizationId: string, filters: ReportFilters) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        name: true,
        currency: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    if (filters.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: filters.branchId,
          organizationId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          timezone: true,
        },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found in this organization.');
      }
    }

    const { startAt, endAt } = this.getDateRange(filters.from, filters.to);

    const baseOrderWhere = {
      organizationId,
      ...(filters.branchId
        ? {
            branchId: filters.branchId,
          }
        : {}),
      createdAt: {
        gte: startAt,
        lte: endAt,
      },
    };

    const nonCancelledOrderWhere = {
      ...baseOrderWhere,
      status: {
        not: 'CANCELLED' as const,
      },
    };

    const paidOrderWhere = {
      ...nonCancelledOrderWhere,
      paymentStatus: 'PAID' as const,
    };

    const [
      orders,
      payments,
      orderItems,
      inventoryItems,
      reservationCounts,
      queueCounts,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: baseOrderWhere,
        select: {
          id: true,
          orderType: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prisma.payment.findMany({
        where: {
          organizationId,
          ...(filters.branchId
            ? {
                branchId: filters.branchId,
              }
            : {}),
          createdAt: {
            gte: startAt,
            lte: endAt,
          },
        },
        select: {
          id: true,
          amount: true,
          method: true,
          orderId: true,
          createdAt: true,
          order: {
            select: {
              status: true,
            },
          },
        },
      }),

      this.prisma.orderItem.findMany({
        where: {
          order: nonCancelledOrderWhere,
        },
        select: {
          productId: true,
          productName: true,
          quantity: true,
          subtotal: true,
          order: {
            select: {
              createdAt: true,
              status: true,
            },
          },
        },
      }),

      this.prisma.inventoryItem.findMany({
        where: {
          organizationId,
          ...(filters.branchId
            ? {
                branchId: filters.branchId,
              }
            : {}),
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          currentStock: true,
          minimumStock: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),

      Promise.all([
        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'PENDING',
          },
        }),

        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'CONFIRMED',
          },
        }),

        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'SEATED',
          },
        }),

        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'COMPLETED',
          },
        }),

        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'CANCELLED',
          },
        }),

        this.prisma.reservation.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            startAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'NO_SHOW',
          },
        }),
      ]),

      Promise.all([
        this.prisma.queueEntry.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            createdAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'WAITING',
          },
        }),

        this.prisma.queueEntry.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            createdAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'CALLED',
          },
        }),

        this.prisma.queueEntry.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            createdAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'SEATED',
          },
        }),

        this.prisma.queueEntry.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            createdAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'CANCELLED',
          },
        }),

        this.prisma.queueEntry.count({
          where: {
            organizationId,
            ...(filters.branchId
              ? {
                  branchId: filters.branchId,
                }
              : {}),
            createdAt: {
              gte: startAt,
              lte: endAt,
            },
            status: 'NO_SHOW',
          },
        }),
      ]),
    ]);

    /*
     * =========================
     * SALES
     * =========================
     *
     * We use recorded Payment rows for collected sales.
     * Cancelled-order payments are excluded.
     */

    const validPayments = payments.filter(
      (payment) => payment.order.status !== 'CANCELLED',
    );

    const sales = validPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const paidOrders = orders.filter(
      (order) => order.status !== 'CANCELLED' && order.paymentStatus === 'PAID',
    );

    const completedOrders = orders.filter(
      (order) => order.status === 'COMPLETED',
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === 'CANCELLED',
    );

    const nonCancelledOrders = orders.filter(
      (order) => order.status !== 'CANCELLED',
    );

    const unpaidOrders = nonCancelledOrders.filter(
      (order) => order.paymentStatus === 'UNPAID',
    );

    const averageOrderValue =
      paidOrders.length > 0 ? sales / paidOrders.length : 0;

    /*
     * =========================
     * ORDER BREAKDOWN
     * =========================
     */

    const orderBreakdownMap = new Map<
      string,
      {
        count: number;
        sales: number;
      }
    >();

    for (const order of nonCancelledOrders) {
      const current = orderBreakdownMap.get(order.orderType) ?? {
        count: 0,
        sales: 0,
      };

      current.count += 1;

      if (order.paymentStatus === 'PAID') {
        /*
         * Use the order total here for order-type sales,
         * matching paid order value.
         */
        current.sales += Number(order.total);
      }

      orderBreakdownMap.set(order.orderType, current);
    }

    const orderBreakdown = Array.from(orderBreakdownMap.entries()).map(
      ([type, value]) => ({
        type,
        count: value.count,
        sales: value.sales,
      }),
    );

    /*
     * =========================
     * PAYMENT BREAKDOWN
     * =========================
     */

    const paymentBreakdownMap = new Map<
      string,
      {
        count: number;
        amount: number;
      }
    >();

    for (const payment of validPayments) {
      const current = paymentBreakdownMap.get(payment.method) ?? {
        count: 0,
        amount: 0,
      };

      current.count += 1;
      current.amount += Number(payment.amount);

      paymentBreakdownMap.set(payment.method, current);
    }

    const paymentBreakdown = Array.from(paymentBreakdownMap.entries()).map(
      ([method, value]) => ({
        method,
        count: value.count,
        amount: value.amount,
      }),
    );

    /*
     * =========================
     * TOP PRODUCTS
     * =========================
     */

    const topProductsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantity: number;
        sales: number;
      }
    >();

    for (const item of orderItems) {
      if (item.order.status === 'CANCELLED') {
        continue;
      }

      const current = topProductsMap.get(item.productId) ?? {
        productId: item.productId,
        productName: item.productName,
        quantity: 0,
        sales: 0,
      };

      current.quantity += item.quantity;
      current.sales += Number(item.subtotal);

      topProductsMap.set(item.productId, current);
    }

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => {
        if (b.sales !== a.sales) {
          return b.sales - a.sales;
        }

        return b.quantity - a.quantity;
      })
      .slice(0, 10);

    /*
     * =========================
     * SALES TREND
     * =========================
     */

    const salesTrendMap = new Map<
      string,
      {
        date: string;
        sales: number;
        orders: number;
      }
    >();

    for (const order of orders) {
      if (order.status === 'CANCELLED') {
        continue;
      }

      const date = this.getDateKey(order.createdAt);

      const current = salesTrendMap.get(date) ?? {
        date,
        sales: 0,
        orders: 0,
      };

      current.orders += 1;

      if (order.paymentStatus === 'PAID') {
        current.sales += Number(order.total);
      }

      salesTrendMap.set(date, current);
    }

    const salesTrend = Array.from(salesTrendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    /*
     * =========================
     * INVENTORY
     * =========================
     */

    const outOfStockItems = inventoryItems
      .filter((item) => Number(item.currentStock) <= 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        currentStock: Number(item.currentStock),
        minimumStock: Number(item.minimumStock),
      }));

    const lowStockItems = inventoryItems
      .filter((item) => {
        const currentStock = Number(item.currentStock);
        const minimumStock = Number(item.minimumStock);

        return currentStock > 0 && currentStock <= minimumStock;
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        currentStock: Number(item.currentStock),
        minimumStock: Number(item.minimumStock),
      }));

    const reservations = {
      pending: reservationCounts[0],
      confirmed: reservationCounts[1],
      seated: reservationCounts[2],
      completed: reservationCounts[3],
      cancelled: reservationCounts[4],
      noShow: reservationCounts[5],
      total: reservationCounts.reduce((sum, value) => sum + value, 0),
    };

    const queue = {
      waiting: queueCounts[0],
      called: queueCounts[1],
      seated: queueCounts[2],
      cancelled: queueCounts[3],
      noShow: queueCounts[4],
      total: queueCounts.reduce((sum, value) => sum + value, 0),
    };

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        currency: organization.currency,
      },

      filters: {
        branchId: filters.branchId ?? null,
        from: filters.from,
        to: filters.to,
      },

      summary: {
        sales,
        orders: nonCancelledOrders.length,
        paidOrders: paidOrders.length,
        unpaidOrders: unpaidOrders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length,
        averageOrderValue,
      },

      salesTrend,

      orderBreakdown,

      paymentBreakdown,

      topProducts,

      inventory: {
        totalItems: inventoryItems.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems,
        outOfStockItems,
      },

      reservations,

      queue,
    };
  }
}
