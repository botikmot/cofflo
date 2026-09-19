import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  /**
   * Create a notification and immediately
   * broadcast it to the branch.
   */
  async create(params: {
    organizationId: string;
    branchId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        organizationId: params.organizationId,
        branchId: params.branchId,
        type: params.type,
        title: params.title,
        message: params.message,
        referenceId: params.referenceId,
        referenceType: params.referenceType,
      },
    });

    this.gateway.emitToBranch(params.branchId, notification);

    return notification;
  }

  /**
   * Get notifications for a branch.
   */
  async findAll(organizationId: string, branchId: string) {
    return this.prisma.notification.findMany({
      where: {
        organizationId,
        branchId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  /**
   * Get unread notification count.
   */
  async getUnreadCount(organizationId: string, branchId: string) {
    return this.prisma.notification.count({
      where: {
        organizationId,
        branchId,
        isRead: false,
      },
    });
  }

  /**
   * Mark one notification as read.
   */
  async markAsRead(
    organizationId: string,
    branchId: string,
    notificationId: string,
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        organizationId,
        branchId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all branch notifications as read.
   */
  async markAllAsRead(organizationId: string, branchId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        organizationId,
        branchId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updated: result.count,
    };
  }
}
