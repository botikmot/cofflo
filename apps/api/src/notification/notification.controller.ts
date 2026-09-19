import { Controller, Get, Param, Patch, Req } from '@nestjs/common';

import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':organizationId/:branchId')
  async findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.notificationService.findAll(organizationId, branchId);
  }

  @Get(':organizationId/:branchId/unread-count')
  async getUnreadCount(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    const count = await this.notificationService.getUnreadCount(
      organizationId,
      branchId,
    );

    return {
      count,
    };
  }

  @Patch(':organizationId/:branchId/:notificationId/read')
  async markAsRead(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(
      organizationId,
      branchId,
      notificationId,
    );
  }

  @Patch(':organizationId/:branchId/read-all')
  async markAllAsRead(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.notificationService.markAllAsRead(organizationId, branchId);
  }
}
