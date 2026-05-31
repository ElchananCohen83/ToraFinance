import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AvrechimModule } from "./modules/avrechim/avrechim.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DonationsModule } from "./modules/donations/donations.module";
import { DonorsModule } from "./modules/donors/donors.module";
import { HealthModule } from "./modules/health/health.module";
import { ReceiptsModule } from "./modules/receipts/receipts.module";
import { ScholarshipsModule } from "./modules/scholarships/scholarships.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    DashboardModule,
    AvrechimModule,
    DonorsModule,
    DonationsModule,
    ReceiptsModule,
    ScholarshipsModule
  ]
})
export class AppModule {}
