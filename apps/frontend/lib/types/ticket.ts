export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING_FOR_CUSTOMER = "WAITING_FOR_CUSTOMER",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum SLAStatus {
  ON_TIME = "ON_TIME",
  AT_RISK = "AT_RISK",
  BREACHED = "BREACHED",
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  slaStatus: SLAStatus
  categoryId: string
  requesterId: string
  agentId: string | null
  customFieldValues: Record<string, any>
  firstResponseDue: string
  resolutionDue: string
  firstResponseAt: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  requester: {
    id: string
    name: string
    email: string
    role: string
  }
  agent: {
    id: string
    name: string
    email: string
    role: string
  } | null
  category: {
    id: string
    name: string
  }
  _count?: {
    comments: number
  }
}

export interface TicketDetail extends Ticket {
  comments: Comment[]
  auditLogs?: AuditLog[]
}

export interface Comment {
  id: string
  content: string
  isInternal: boolean
  ticketId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface AuditLog {
  id: string
  ticketId: string
  userId: string
  action: string
  description: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface CreateTicketDto {
  title: string
  description: string
  categoryId: string
  priority?: TicketPriority
  customFieldValues?: Record<string, any>
}

export interface UpdateTicketDto {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  agentId?: string
  customFieldValues?: Record<string, any>
  lastUpdatedAt?: string
}

export interface TicketQueryDto {
  status?: TicketStatus[]
  assignedTo?: string
  createdBy?: string
  category?: string
  page?: number
  limit?: number
}

export interface CreateCommentDto {
  content: string
  isInternal?: boolean
}

export interface TicketListResponse {
  hasMore: any
  tickets: Ticket[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
