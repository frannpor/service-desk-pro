import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { DashboardService } from "./dashboard.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("dashboard")
@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.AGENT)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }

  @Get("metrics")
  @ApiOperation({ summary: "Get dashboard metrics and SLA alerts" })
  @ApiQuery({ name: "period", required: false, enum: ["7d", "30d"] })
  getMetrics(@Query("period") period?: "7d" | "30d") {
    return this.dashboardService.getMetrics(period)
  }

  @Get("trends")
  @ApiOperation({ summary: "Get ticket creation and resolution trends" })
  @ApiQuery({ name: "days", required: false, type: Number })
  getTicketTrends(@Query("days") days?: string) {
    const daysNum = days ? Number.parseInt(days, 10) : 30
    return this.dashboardService.getTicketTrends(daysNum)
  }

  @Get("categories")
  @ApiOperation({ summary: "Get ticket metrics by category" })
  getCategoryMetrics() {
    return this.dashboardService.getCategoryMetrics()
  }

  @Get("agents")
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: "Get agent performance metrics (Manager only)" })
  getAgentPerformance() {
    return this.dashboardService.getAgentPerformance()
  }
}
