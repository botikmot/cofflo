import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { QueueModule } from '../queue/queue.module';

import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    ReservationsModule,
    QueueModule,
    OrdersModule,
    NotificationModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
