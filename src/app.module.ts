import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { LoansModule } from './loans/loans.module';
import { ReturnsModule } from './returns/returns.module';
import { FinesModule } from './fines/fines.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    NotificationsModule,
    SettingsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ItemsModule,
    LoansModule,
    ReturnsModule,
    FinesModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule {}
