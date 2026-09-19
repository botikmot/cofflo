import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from '../reservations/reservations.service';
import { QueueService } from '../queue/queue.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationsService: ReservationsService,
    private readonly queueService: QueueService,
    private readonly notificationService: NotificationService,
  ) {}

  async getTableByQrToken(qrToken: string) {
    const table = await this.prisma.table.findFirst({
      where: {
        qrToken,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        location: true,
        photoUrl: true,
        customerSelectable: true,
        status: true,

        branch: {
          select: {
            id: true,
            name: true,
            slug: true,

            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(
        'Table QR code is invalid or no longer available.',
      );
    }

    return {
      table: {
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        photoUrl: table.photoUrl,
        customerSelectable: table.customerSelectable,
        status: table.status,
      },

      branch: table.branch,

      organization: table.branch.organization,
    };
  }

  async getPublicBranch(branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        organizationId: true,

        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            tagline: true,
            slug: true,
            currency: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return branch;
  }

  async getReservationAvailability(
    branchId: string,
    startAt: string,
    endAt: string,
    guestCount: number,
  ) {
    const branch = await this.getPublicBranch(branchId);

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    const tables = await this.reservationsService.findAvailableTables(
      branch.organizationId,
      branch.id,
      startDate,
      endDate,
      guestCount,
    );

    return {
      branch: {
        id: branch.id,
        name: branch.name,
      },

      organization: {
        id: branch.organization.id,
        name: branch.organization.name,
        currency: branch.organization.currency,
      },

      startAt: startDate,
      endAt: endDate,
      guestCount,

      tables: tables.map((table) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        photoUrl: table.photoUrl,
        status: table.status,
      })),
    };
  }

  async createPublicReservation(
    branchId: string,
    data: {
      customerName: string;
      customerPhone?: string;
      guestCount: number;
      startAt: string;
      endAt: string;
      tableId?: string;
      notes?: string;
    },
  ) {
    const branch = await this.getPublicBranch(branchId);

    const reservation = await this.reservationsService.create(
      branch.organizationId,
      branch.id,
      data,
    );

    try {
      await this.notificationService.create({
        organizationId: branch.organizationId,
        branchId: branch.id,
        type: NotificationType.TABLE_RESERVATION,
        title: 'New Table Reservation',
        message: `${reservation.customerName} reserved a table for ${reservation.guestCount} guest(s).`,
        referenceId: reservation.id,
        referenceType: 'RESERVATION',
      });
    } catch (error) {
      console.error(
        '[Notifications] Failed to create reservation notification:',
        error,
      );
    }

    return {
      publicToken: reservation.publicToken,
      customerName: reservation.customerName,
      guestCount: reservation.guestCount,
      startAt: reservation.startAt,
      endAt: reservation.endAt,
      status: reservation.status,

      table: reservation.table
        ? {
            id: reservation.table.id,
            name: reservation.table.name,
            capacity: reservation.table.capacity,
            location: reservation.table.location,
            photoUrl: reservation.table.photoUrl,
          }
        : null,

      branch: {
        id: branch.id,
        name: branch.name,
      },
    };
  }

  async getReservationByPublicToken(publicToken: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        publicToken,
      },

      select: {
        publicToken: true,
        customerName: true,
        customerPhone: true,
        guestCount: true,
        startAt: true,
        endAt: true,
        status: true,
        notes: true,

        table: {
          select: {
            name: true,
            capacity: true,
            location: true,
            photoUrl: true,
          },
        },

        branch: {
          select: {
            name: true,

            organization: {
              select: {
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    return reservation;
  }

  async joinPublicQueue(
    branchId: string,
    data: {
      customerName: string;
      customerPhone?: string;
      guestCount: number;
      notes?: string;
    },
  ) {
    const branch = await this.getPublicBranch(branchId);

    const queueEntry = await this.queueService.joinQueue(
      branch.organizationId,
      branch.id,
      data,
    );

    try {
      await this.notificationService.create({
        organizationId: branch.organizationId,
        branchId: branch.id,
        type: NotificationType.WAITLIST_JOINED,
        title: 'New Waitlist Entry',
        message: `${queueEntry.customerName} joined the waitlist for ${queueEntry.guestCount} guest(s).`,
        referenceId: queueEntry.id,
        referenceType: 'QUEUE_ENTRY',
      });
    } catch (error) {
      console.error(
        '[Notifications] Failed to create waitlist notification:',
        error,
      );
    }

    return {
      publicToken: queueEntry.publicToken,
      queueNumber: queueEntry.queueNumber,
      customerName: queueEntry.customerName,
      guestCount: queueEntry.guestCount,
      status: queueEntry.status,
      joinedAt: queueEntry.joinedAt,

      branch: {
        id: branch.id,
        name: branch.name,
      },
    };
  }

  async getQueueByPublicToken(publicToken: string) {
    const entry = await this.prisma.queueEntry.findUnique({
      where: {
        publicToken,
      },

      select: {
        publicToken: true,
        queueDate: true,
        queueNumber: true,
        customerName: true,
        guestCount: true,
        status: true,
        joinedAt: true,
        calledAt: true,
        seatedAt: true,
        branchId: true,

        table: {
          select: {
            name: true,
            capacity: true,
            location: true,
            photoUrl: true,
          },
        },

        branch: {
          select: {
            name: true,

            organization: {
              select: {
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Queue entry not found.');
    }

    let position: number | null = null;

    if (entry.status === 'WAITING') {
      const aheadCount = await this.prisma.queueEntry.count({
        where: {
          branchId: entry.branchId,
          queueDate: entry.queueDate,
          status: 'WAITING',
          joinedAt: {
            lt: entry.joinedAt,
          },
        },
      });

      position = aheadCount + 1;
    }

    return {
      publicToken: entry.publicToken,
      queueNumber: entry.queueNumber,
      customerName: entry.customerName,
      guestCount: entry.guestCount,
      status: entry.status,
      joinedAt: entry.joinedAt,
      calledAt: entry.calledAt,
      seatedAt: entry.seatedAt,
      position,
      table: entry.table,
      branch: entry.branch,
    };
  }

  async getPublicOrder(publicToken: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        publicToken,
      },
      select: {
        publicToken: true,
        orderNumber: true,
        orderType: true,
        status: true,
        paymentStatus: true,
        currency: true,
        subtotal: true,
        total: true,
        table: {
          select: {
            name: true,
            location: true,
          },
        },
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
          },
        },
        branch: {
          select: {
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async getPublicMenu(branchId: string) {
    const branch = await this.getPublicBranch(branchId);

    const products = await this.prisma.product.findMany({
      where: {
        organizationId: branch.organizationId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          category: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });

    const categories = new Map<
      string,
      {
        id: string;
        name: string;
        products: typeof products;
      }
    >();

    for (const product of products) {
      if (!product.category) {
        continue;
      }

      const existing = categories.get(product.category.id);

      if (existing) {
        existing.products.push(product);
        continue;
      }

      categories.set(product.category.id, {
        id: product.category.id,
        name: product.category.name,
        products: [product],
      });
    }

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
      },
      organization: {
        id: branch.organization.id,
        name: branch.organization.name,
        slug: branch.organization.slug,
        currency: branch.organization.currency,
      },
      categories: Array.from(categories.values()),
    };
  }

  async getAvailableTables(branchId: string) {
    const branch = await this.getPublicBranch(branchId);

    const tables = await this.prisma.table.findMany({
      where: {
        organizationId: branch.organizationId,
        branchId: branch.id,
        isActive: true,
        customerSelectable: true,
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        location: true,
        photoUrl: true,
        customerSelectable: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
      },
      tables,
    };
  }
}
