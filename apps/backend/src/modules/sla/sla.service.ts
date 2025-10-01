import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../../common/prisma/prisma.service"
import { SLAStatus, TicketStatus } from "@prisma/client"

@Injectable()
export class SLAService {
  constructor(private prisma: PrismaService) {}

  async updateSLAStatuses() {
    const now = new Date()

    // Get all active tickets that need SLA status updates
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          not: TicketStatus.CLOSED,
        },
      },
      select: {
        id: true,
        createdAt: true,
        firstResponseDue: true,
        resolutionDue: true,
        firstResponseAt: true,
        resolvedAt: true,
        slaStatus: true,
      },
    })

    const updates = [] as { id: string; slaStatus: SLAStatus }[]

    for (const ticket of tickets) {
      const newSLAStatus = this.calculateSLAStatus(ticket, now)

      if (newSLAStatus !== ticket.slaStatus) {
        updates.push({
          id: ticket.id,
          slaStatus: newSLAStatus,
        })
      }
    }

    // Batch update SLA statuses
    if (updates.length > 0) {
      await this.prisma.$transaction(
        updates.map((update: { id: string; slaStatus: SLAStatus }) =>
          this.prisma.ticket.update({
            where: { id: update.id },
            data: { slaStatus: update.slaStatus },
          }),
        ),
      )

      console.log(`Updated SLA status for ${updates.length} tickets`)
    }

    return { updated: updates.length }
  }

  public calculateSLAStatus(
    ticket: {
      createdAt: Date
      firstResponseDue: Date | null
      resolutionDue: Date | null
      firstResponseAt: Date | null
      resolvedAt: Date | null
    },
    now: Date,
  ): SLAStatus {
    // If ticket is resolved, check if it was resolved on time
    if (ticket.resolvedAt) {
      return ticket.resolutionDue && ticket.resolvedAt > ticket.resolutionDue ? SLAStatus.BREACHED : SLAStatus.ON_TIME
    }

    // Check first response SLA if not yet responded
    if (!ticket.firstResponseAt) {
      if (ticket.firstResponseDue) {
        if (now > ticket.firstResponseDue) {
          return SLAStatus.BREACHED
        }

        const totalTime = ticket.firstResponseDue.getTime() - ticket.createdAt.getTime()
        const remainingTime = ticket.firstResponseDue.getTime() - now.getTime()

        if (remainingTime / totalTime < 0.25) {
          return SLAStatus.AT_RISK
        }
      }
    }

    // Check resolution SLA
    if (ticket.resolutionDue) {
      if (now > ticket.resolutionDue) {
        return SLAStatus.BREACHED
      }

      const totalResolutionTime = ticket.resolutionDue.getTime() - ticket.createdAt.getTime()
      const remainingResolutionTime = ticket.resolutionDue.getTime() - now.getTime()

      if (remainingResolutionTime / totalResolutionTime < 0.25) {
        return SLAStatus.AT_RISK
      }
    }

    return SLAStatus.ON_TIME
  }

  async getSLABreaches() {
    return this.prisma.ticket.findMany({
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
    })
  }

  async getAtRiskTickets() {
    return this.prisma.ticket.findMany({
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
    })
  }
}
