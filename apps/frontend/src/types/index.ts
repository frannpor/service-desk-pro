export interface User {
  id: string
  email: string
  name: string
  role: "REQUESTER" | "AGENT" | "MANAGER"
  createdAt: string
  updatedAt: string
}

export type UserRole = 'REQUESTER' | 'AGENT' | 'MANAGER';

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  firstResponseSLA: number
  resolutionSLA: number
  customFields: CustomField[]
  createdAt: string
  updatedAt: string
}

export interface CustomField {
  id: string
  name: string
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "date" | "checkbox"
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "WAITING_FOR_AGENT" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  customFieldValues: Record<string, any>
  slaStatus: "ON_TIME" | "AT_RISK" | "BREACHED"
  firstResponseDue?: string
  resolutionDue?: string
  firstResponseAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  requester: User
  agent?: User
  category: Category
  comments?: Comment[]
  auditLogs?: AuditLog[]
  _count?: { comments: number }
}

export interface Comment {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
  author: User
}

export interface AuditLog {
  id: string
  action: string
  description: string
  oldValue?: any
  newValue?: any
  createdAt: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}