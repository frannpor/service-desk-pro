import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./common/prisma/prisma.module"
import { AuthModule } from "./modules/auth/auth.module"
import { UsersModule } from "./modules/users/users.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { TicketsModule } from "./modules/tickets/tickets.module"
import { DashboardModule } from "./modules/dashboard/dashboard.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TicketsModule,
    DashboardModule,
  ],
})
export class AppModule {}
