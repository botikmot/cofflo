import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationsModule } from './organizations/organizations.module';
import { BranchesModule } from './branches/branches.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MailModule } from './mail/mail.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { TablesModule } from './tables/tables.module';
import { PublicModule } from './public/public.module';
import { ReservationsModule } from './reservations/reservations.module';
import { QueueModule } from './queue/queue.module';
import { TableSessionsModule } from './table-sessions/table-sessions.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OrganizationsModule,
    BranchesModule,
    MembershipsModule,
    AuthModule,
    InvitationsModule,
    MailModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    TablesModule,
    PublicModule,
    ReservationsModule,
    QueueModule,
    TableSessionsModule,
    UploadsModule,
    ReportsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
