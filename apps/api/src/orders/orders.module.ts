import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TableSessionsModule } from '../table-sessions/table-sessions.module';

@Module({
  imports: [PrismaModule, TableSessionsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
