import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import { AssignQueueTableDto } from './dto/assign-queue-table.dto';
import { JoinQueueDto } from './dto/join-queue.dto';
import { QueueService } from './queue.service';

@Controller('organizations/:organizationId/branches/:branchId/queue')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  joinQueue(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: JoinQueueDto,
  ) {
    return this.queueService.joinQueue(organizationId, branchId, dto);
  }

  @Get()
  getTodayQueue(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.queueService.getTodayQueue(organizationId, branchId);
  }

  @Get(':queueEntryId/position')
  getPosition(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('queueEntryId') queueEntryId: string,
  ) {
    return this.queueService.getPosition(
      organizationId,
      branchId,
      queueEntryId,
    );
  }

  @Post('call-next')
  callNext(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: AssignQueueTableDto,
  ) {
    return this.queueService.callNext(organizationId, branchId, dto);
  }

  @Post(':queueEntryId/seated')
  markSeated(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('queueEntryId') queueEntryId: string,
  ) {
    return this.queueService.markSeated(organizationId, branchId, queueEntryId);
  }

  @Post(':queueEntryId/cancel')
  cancel(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('queueEntryId') queueEntryId: string,
  ) {
    return this.queueService.cancel(organizationId, branchId, queueEntryId);
  }

  @Post('tables/:tableId/release')
  releaseTable(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.queueService.releaseTable(organizationId, branchId, tableId);
  }

  @Get('summary')
  getQueueSummary(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.queueService.getQueueSummary(organizationId, branchId);
  }

  @Get('next')
  getNextForTable(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('tableId') tableId: string,
  ) {
    return this.queueService.getNextForTable(organizationId, branchId, tableId);
  }
}
