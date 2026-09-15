import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TableSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureOpenSession(
    tx: Prisma.TransactionClient,
    organizationId: string,
    branchId: string,
    tableId: string,
  ) {
    const table = await tx.table.findFirst({
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
      throw new NotFoundException('Table not found.');
    }

    if (table.status === 'UNAVAILABLE') {
      throw new ConflictException('This table is unavailable.');
    }

    const existingSession = await tx.tableSession.findFirst({
      where: {
        organizationId,
        branchId,
        tableId,
        status: 'OPEN',
      },
      orderBy: {
        openedAt: 'desc',
      },
    });

    if (existingSession) {
      return existingSession;
    }

    await tx.table.update({
      where: {
        id: table.id,
      },
      data: {
        status: 'OCCUPIED',
      },
    });

    return tx.tableSession.create({
      data: {
        organizationId,
        branchId,
        tableId,
        status: 'OPEN',
      },
    });
  }

  async openSession(organizationId: string, branchId: string, tableId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const session = await this.ensureOpenSession(
          tx,
          organizationId,
          branchId,
          tableId,
        );

        return tx.tableSession.findUnique({
          where: {
            id: session.id,
          },
          include: {
            table: true,
            orders: {
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                items: true,
              },
            },
          },
        });
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  async getActiveSession(
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
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found.');
    }

    return this.prisma.tableSession.findFirst({
      where: {
        organizationId,
        branchId,
        tableId,
        status: 'OPEN',
      },
      include: {
        table: true,
        orders: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  async closeSession(
    organizationId: string,
    branchId: string,
    sessionId: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const session = await tx.tableSession.findFirst({
          where: {
            id: sessionId,
            organizationId,
            branchId,
          },
        });

        if (!session) {
          throw new NotFoundException('Table session not found.');
        }

        if (session.status === 'CLOSED') {
          return tx.tableSession.findUnique({
            where: {
              id: session.id,
            },
            include: {
              table: true,
              orders: {
                orderBy: {
                  createdAt: 'asc',
                },
                include: {
                  items: true,
                },
              },
            },
          });
        }

        const activeOrders = await tx.order.count({
          where: {
            tableSessionId: session.id,
            status: {
              notIn: ['COMPLETED', 'CANCELLED'],
            },
          },
        });

        if (activeOrders > 0) {
          throw new ConflictException(
            'This table still has active orders. Complete all orders before closing the table.',
          );
        }

        const unpaidOrders = await tx.order.count({
          where: {
            tableSessionId: session.id,
            status: {
              not: 'CANCELLED',
            },
            paymentStatus: {
              not: 'PAID',
            },
          },
        });

        if (unpaidOrders > 0) {
          throw new ConflictException('This table still has unpaid orders.');
        }

        const updatedSession = await tx.tableSession.update({
          where: {
            id: session.id,
          },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
          },
          include: {
            table: true,
            orders: {
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                items: true,
              },
            },
          },
        });

        await tx.table.update({
          where: {
            id: session.tableId,
          },
          data: {
            status: 'AVAILABLE',
          },
        });

        return updatedSession;
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  /*
   * Used by OrdersService so session + order can live
   * inside one database transaction.
   */
  async ensureOpenSessionInTransaction(
    tx: Prisma.TransactionClient,
    organizationId: string,
    branchId: string,
    tableId: string,
  ) {
    return this.ensureOpenSession(tx, organizationId, branchId, tableId);
  }

  async getSession(
    organizationId: string,
    branchId: string,
    sessionId: string,
  ) {
    const session = await this.prisma.tableSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
        branchId,
      },
      include: {
        table: true,
        orders: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Table session not found.');
    }

    return session;
  }
}
