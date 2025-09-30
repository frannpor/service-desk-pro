import { Module } from "@nestjs/common"
import { TicketsService } from "./tickets.service"
import { TicketsController } from "./tickets.controller"
import { CategoriesModule } from "../categories/categories.module"

@Module({
  imports: [CategoriesModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
