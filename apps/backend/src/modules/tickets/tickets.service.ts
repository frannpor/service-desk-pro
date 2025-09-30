import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { CategoriesService } from "../categories/categories.service"
import { CreateTicketDto, UpdateTicketDto, TicketQueryDto, CreateCommentDto } from "./dto/ticket.dto"
import { TicketStatus, UserRole, AuditAction, SLAStatus } from "@prisma/client"

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
  ) { }

  async create(createTicketDto: CreateTicketDto, userId: string) {
    // Get category to calculate SLA
    const category = await this.categoriesService.findOne(createTicketDto.categoryId)

    const now = new Date()
    const firstResponseDue = new Date(now.getTime() + category.firstResponseSLA * 60 * 1000)
    const resolutionDue = new Date(now.getTime() + category.resolutionSLA * 60 * 1000)

    // Create ticket with SLA dates
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        requesterId: userId,
        firstResponseDue,
        resolutionDue,
        slaStatus: SLAStatus.ON_TIME,
      },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        agent: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    // Create audit log
    await this.createAuditLog(ticket.id, userId, AuditAction.CREATED, "Ticket created")

    return ticket
  }

  async findAll(query: TicketQueryDto, userId: string, userRole: UserRole) {
    const { status, assignedTo, createdBy, category, page = 1, limit = 10 } = query

    // Build where clause based on user role
    const where: any = {}

    if (userRole === UserRole.REQUESTER) {
      // Requesters can only see their own tickets
      where.requesterId = userId
    } else if (userRole === UserRole.AGENT) {
      // Agents can see all tickets, but filter by assignment if specified
      if (assignedTo) {
        where.agentId = assignedTo
      }
    }
    // Managers can see all tickets without restrictions

    // Apply filters
    if (status && status.length > 0) {
      where.status = { in: status }
    }
    if (createdBy && userRole !== UserRole.REQUESTER) {
      where.requesterId = createdBy
    }
    if (category) {
      where.categoryId = category
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true, role: true } },
          agent: { select: { id: true, name: true, email: true, role: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ])

    return {
      tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        agent: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
          where: userRole === UserRole.REQUESTER ? { isInternal: false } : {},
        },
        auditLogs:
          userRole !== UserRole.REQUESTER
            ? {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
              orderBy: { createdAt: "desc" },
            }
            : false,
      },
    })

    if (!ticket) {
      throw new NotFoundException("Ticket not found")
    }

    // Check permissions
    if (userRole === UserRole.REQUESTER && ticket.requesterId !== userId) {
      throw new ForbiddenException("You can only view your own tickets")
    }

    return ticket
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole) {
    const ticket = await this.findOne(id, userId, userRole)

    // Check permissions for different updates
    if (userRole === UserRole.REQUESTER) {
      // Requesters can only update their own tickets and limited fields
      if (ticket.requesterId !== userId) {
        throw new ForbiddenException("You can only update your own tickets")
      }
      // Requesters can only update custom field values and priority
      const allowedFields = ["customFieldValues", "priority"]
      const updateFields = Object.keys(updateTicketDto)
      const hasDisallowedFields = updateFields.some((field) => !allowedFields.includes(field))
      if (hasDisallowedFields) {
        throw new ForbiddenException("You can only update custom fields and priority")
      }
    }

    // Handle optimistic locking
    if (updateTicketDto.lastUpdatedAt) {
      if (ticket.updatedAt.getTime() !== new Date(updateTicketDto.lastUpdatedAt).getTime()) {
        throw new ConflictException("Ticket was modified by another user")
      }
    }

    // Track changes for audit
    const changes: any = {}
    Object.keys(updateTicketDto).forEach((key) => {
      if (key !== "lastUpdatedAt" && updateTicketDto[key] !== ticket[key]) {
        changes[key] = { old: ticket[key], new: updateTicketDto[key] }
      }
    })

    // Update SLA status if status changed
    let slaUpdates = {}
    if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
      slaUpdates = this.calculateSLAUpdates(updateTicketDto.status, ticket)
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
        ...slaUpdates,
      },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        agent: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    // Create audit logs for changes
    for (const [field, change] of Object.entries(changes) as [string, { old: any; new: any }][]) {
      await this.createAuditLog(
        id,
        userId,
        this.getAuditAction(field),
        `${field} changed from ${change.old} to ${change.new}`,
        change.old,
        change.new,
      )
    }

    return updatedTicket
  }

  async addComment(ticketId: string, createCommentDto: CreateCommentDto, userId: string, userRole: UserRole) {
    // Verify ticket exists and user has access
    await this.findOne(ticketId, userId, userRole)

    // Only agents and managers can add internal comments
    if (createCommentDto.isInternal && userRole === UserRole.REQUESTER) {
      throw new ForbiddenException("You cannot add internal comments")
    }

    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        ticketId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    // Create audit log
    await this.createAuditLog(
      ticketId,
      userId,
      AuditAction.COMMENTED,
      `Added ${createCommentDto.isInternal ? "internal" : "public"} comment`,
    )

    // Update first response time if this is the first agent response
    const ticket = await this.prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } })
    if (!ticket.firstResponseAt && userRole !== UserRole.REQUESTER) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date() },
      })
    }

    return comment
  }

  private calculateSLAUpdates(newStatus: TicketStatus, ticket: any) {
    const updates: any = {}

    // Set resolved timestamp
    if (newStatus === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      updates.resolvedAt = new Date()
    }

    // Clear resolved timestamp if reopening
    if (ticket.status === TicketStatus.RESOLVED && newStatus !== TicketStatus.RESOLVED) {
      updates.resolvedAt = null
    }

    return updates
  }

  private getAuditAction(field: string): AuditAction {
    switch (field) {
      case "status":
        return AuditAction.STATUS_CHANGED
      case "agentId":
        return AuditAction.ASSIGNED
      default:
        return AuditAction.UPDATED
    }
  }

  private async createAuditLog(
    ticketId: string,
    userId: string,
    action: AuditAction,
    description: string,
    oldValue?: any,
    newValue?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        ticketId,
        userId,
        action,
        description,
        oldValue: oldValue !== undefined ? JSON.stringify(oldValue) : undefined,
        newValue: newValue !== undefined ? JSON.stringify(newValue) : undefined,
      },
    })
  }
}
