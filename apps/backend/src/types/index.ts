import { AuditLog, Category, Ticket, TicketPriority, TicketStatus, User, UserRole } from '@prisma/client'

export {
  User,
  UserRole,
  Ticket,
  TicketStatus,
  TicketPriority,
  SLAStatus,
  Category,
  Comment,
  AuditLog,
  AuditAction,
} from '@prisma/client'

// Additional custom types if needed
export interface CreateUserDto {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserDto {
  name?: string
  role?: UserRole
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
}

// Database response types
export interface UserWithRelations extends User {
  createdTickets?: Ticket[]
  assignedTickets?: Ticket[]
  comments?: Comment[]
}

export interface TicketWithRelations extends Ticket {
  requester: User
  agent?: User
  category: Category
  comments?: Comment[]
  auditLogs?: AuditLog[]
}