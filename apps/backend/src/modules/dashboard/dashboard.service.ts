import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { TicketStatus, SLAStatus } from "@prisma/client"

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getMetrics(period: "7d" | "30d" = "7d") {
    const now = new Date()
    const periodStart = new Date(now.getTime() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(periodStart.getTime() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000)

    // Ticket volume metrics
    const [currentVolume, previousVolume] = await Promise.all([
      this.prisma.ticket.count({
        where: { createdAt: { gte: periodStart } },
      }),
      this.prisma.ticket.count({
        where: {
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      }),
    ])

    const volumeChange = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0

    // SLA compliance metrics
    const totalTickets = await this.prisma.ticket.count({
      where: { createdAt: { gte: periodStart } },
    })

    const firstResponseCompliance = await this.prisma.ticket.count({
      where: {
        createdAt: { gte: periodStart },
        AND: [{ firstResponseAt: { not: null } }, { firstResponseAt: { lte: this.prisma.ticket.fields.firstResponseDue } }],
      },
    })

    const resolutionCompliance = await this.prisma.ticket.count({
      where: {
        createdAt: { gte: periodStart },
        AND: [{ resolvedAt: { not: null } }, { resolvedAt: { lte: this.prisma.ticket.fields.resolutionDue } }],
      },
    })

    const resolvedTickets = await this.prisma.ticket.count({
      where: {
        createdAt: { gte: periodStart },
        resolvedAt: { not: null },
      },
    })

    // Average response and resolution times
    // const avgTimes = await this.prisma.ticket.aggregate({
    //   where: {
    //     createdAt: { gte: periodStart },
    //     firstResponseAt: { not: null },
    //   },
    //   _avg: {
    //     // We'll calculate this in raw SQL for better performance
    //   },
    // })

    // Get average times with raw SQL for better calculation
    const avgResponseTime = await this.prisma.$queryRaw<[{ avg_minutes: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60) as avg_minutes
      FROM tickets 
      WHERE created_at >= ${periodStart} AND first_response_at IS NOT NULL
    `

    const avgResolutionTime = await this.prisma.$queryRaw<[{ avg_minutes: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_minutes
      FROM tickets 
      WHERE created_at >= ${periodStart} AND resolved_at IS NOT NULL
    `

    // Backlog analysis
    const backlog = await this.prisma.ticket.groupBy({
      by: ["status"],
      where: {
        status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_CUSTOMER] },
      },
      _count: true,
    })

    const backlogByAge = await this.prisma.$queryRaw<Array<{ age_group: string; count: number }>>`
      SELECT 
        CASE 
          WHEN created_at >= NOW() - INTERVAL '1 day' THEN '0-1d'
          WHEN created_at >= NOW() - INTERVAL '3 days' THEN '1-3d'
          WHEN created_at >= NOW() - INTERVAL '7 days' THEN '3-7d'
          ELSE '7d+'
        END as age_group,
        COUNT(*) as count
      FROM tickets 
      WHERE status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER')
      GROUP BY age_group
    `

    // SLA breach alerts
    const slaBreaches = await this.prisma.ticket.findMany({
      where: {
        slaStatus: SLAStatus.BREACHED,
        status: { not: TicketStatus.CLOSED },
      },
      include: {
        requester: { select: { name: true, email: true } },
        agent: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const atRiskTickets = await this.prisma.ticket.findMany({
      where: {
        slaStatus: SLAStatus.AT_RISK,
        status: { not: TicketStatus.CLOSED },
      },
      include: {
        requester: { select: { name: true, email: true } },
        agent: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { firstResponseDue: "asc" },
      take: 10,
    })

    return {
      period,
      metrics: {
        ticketVolume: {
          current: currentVolume,
          previous: previousVolume,
          change: Math.round(volumeChange * 100) / 100,
        },
        slaCompliance: {
          firstResponse: totalTickets > 0 ? Math.round((firstResponseCompliance / totalTickets) * 100) : 0,
          resolution: resolvedTickets > 0 ? Math.round((resolutionCompliance / resolvedTickets) * 100) : 0,
        },
        averageTimes: {
          firstResponse: Math.round((avgResponseTime[0]?.avg_minutes || 0) * 100) / 100,
          resolution: Math.round((avgResolutionTime[0]?.avg_minutes || 0) * 100) / 100,
        },
        backlog: {
          total: backlog.reduce((sum, item) => sum + item._count, 0),
          byAge: backlogByAge.reduce(
            (acc, item) => {
              acc[item.age_group] = Number(item.count)
              return acc
            },
            { "0-1d": 0, "1-3d": 0, "3-7d": 0, "7d+": 0 },
          ),
        },
      },
      alerts: {
        breached: slaBreaches,
        atRisk: atRiskTickets,
      },
    }
  }

  async getTicketTrends(days = 30) {
    const trends = await this.prisma.$queryRaw<Array<{ date: string; created: number; resolved: number }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created,
        COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved
      FROM tickets 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return trends.map((trend) => ({
      date: trend.date,
      created: Number(trend.created),
      resolved: Number(trend.resolved),
    }))
  }

  async getCategoryMetrics() {
    const categoryStats = await this.prisma.ticket.groupBy({
      by: ["categoryId"],
      _count: true,
      // _avg: {
      //   // We'll use raw SQL for better time calculations
      // },
    })

    const categoryDetails = await this.prisma.category.findMany({
      select: { id: true, name: true },
    })

    const categoryMap = categoryDetails.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name
        return acc
      },
      {} as Record<string, string>,
    )

    return categoryStats.map((stat) => ({
      categoryId: stat.categoryId,
      categoryName: categoryMap[stat.categoryId] || "Unknown",
      ticketCount: stat._count,
    }))
  }

  async getAgentPerformance() {
    const agentStats = await this.prisma.$queryRaw<
      Array<{
        agent_id: string
        agent_name: string
        assigned_tickets: number
        resolved_tickets: number
        avg_resolution_time: number
        sla_compliance: number
      }>
    >`
      SELECT 
        u.id as agent_id,
        u.name as agent_name,
        COUNT(t.id) as assigned_tickets,
        COUNT(CASE WHEN t.resolved_at IS NOT NULL THEN 1 END) as resolved_tickets,
        AVG(CASE WHEN t.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/60 
            END) as avg_resolution_time,
        ROUND(
          COUNT(CASE WHEN t.resolved_at IS NOT NULL AND t.resolved_at <= t.resolution_due THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN t.resolved_at IS NOT NULL THEN 1 END), 0)
        ) as sla_compliance
      FROM users u
      LEFT JOIN tickets t ON u.id = t.agent_id
      WHERE u.role = 'AGENT'
      GROUP BY u.id, u.name
      ORDER BY assigned_tickets DESC
    `

    return agentStats.map((stat) => ({
      agentId: stat.agent_id,
      agentName: stat.agent_name,
      assignedTickets: Number(stat.assigned_tickets),
      resolvedTickets: Number(stat.resolved_tickets),
      avgResolutionTime: Math.round((stat.avg_resolution_time || 0) * 100) / 100,
      slaCompliance: Number(stat.sla_compliance) || 0,
    }))
  }
}
