import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { TableSessionsModule } from '../table-sessions/table-sessions.module';

@Module({
  imports: [PrismaModule, TableSessionsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
