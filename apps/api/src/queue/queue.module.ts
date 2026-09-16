import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { TableSessionsModule } from '../table-sessions/table-sessions.module';

@Module({
  imports: [PrismaModule, TableSessionsModule],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
