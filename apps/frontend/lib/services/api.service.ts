import { apiRequest, ApiError } from "../utils/api"
import { API_ENDPOINTS } from "../constants/api"
import type {
  TicketDetail,
  TicketListResponse,
  TicketQueryDto,
  CreateTicketDto,
  UpdateTicketDto,
  CreateCommentDto,
} from "../types/ticket"
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types/category"
import type { User, LoginDto, RegisterDto, AuthResponse } from "../types/user"
import type { DashboardMetrics, TicketTrend, CategoryMetric, AgentPerformance } from "../types/dashboard"

export { ApiError }

// Auth Service
export const AuthService = {
  async register(userData: RegisterDto): Promise<AuthResponse> {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async login(credentials: LoginDto): Promise<AuthResponse> {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  async getProfile(): Promise<{ user: User }> {
    return apiRequest(API_ENDPOINTS.AUTH.PROFILE)
  },

  async logout(): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" })
    } catch (error) {
      console.error("Backend logout failed:", error)
    }
  },
}

// Ticket Service
export const TicketService = {
  async getTickets(query: TicketQueryDto = {}): Promise<TicketListResponse> {
    const params = new URLSearchParams()

    if (query.status && query.status.length > 0) {
      query.status.forEach((status) => params.append("status", status))
    }
    if (query.assignedTo) params.append("assignedTo", query.assignedTo)
    if (query.createdBy) params.append("createdBy", query.createdBy)
    if (query.category) params.append("category", query.category)
    if (query.page) params.append("page", query.page.toString())
    if (query.limit) params.append("limit", query.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.TICKETS.LIST}?${queryString}` : API_ENDPOINTS.TICKETS.LIST

    return apiRequest<TicketListResponse>(endpoint)
  },

  async getTicketById(id: string): Promise<TicketDetail> {
    return apiRequest<TicketDetail>(API_ENDPOINTS.TICKETS.DETAIL(id))
  },

  async createTicket(data: CreateTicketDto): Promise<TicketDetail> {
    return apiRequest<TicketDetail>(API_ENDPOINTS.TICKETS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async updateTicket(id: string, data: UpdateTicketDto): Promise<TicketDetail> {
    return apiRequest<TicketDetail>(API_ENDPOINTS.TICKETS.UPDATE(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async addComment(ticketId: string, data: CreateCommentDto): Promise<Comment> {
    return apiRequest<Comment>(API_ENDPOINTS.TICKETS.COMMENT(ticketId), {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}

// Category Service
export const CategoryService = {
  async getCategories(includeInactive = false): Promise<Category[]> {
    const params = includeInactive ? "?includeInactive=true" : ""
    return apiRequest<Category[]>(`${API_ENDPOINTS.CATEGORIES.LIST}${params}`)
  },

  async getCategoryById(id: string): Promise<Category> {
    return apiRequest<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id))
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    return apiRequest<Category>(API_ENDPOINTS.CATEGORIES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    return apiRequest<Category>(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async deleteCategory(id: string): Promise<Category> {
    return apiRequest<Category>(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      method: "DELETE",
    })
  },
}

// Dashboard Service
export const DashboardService = {
  async getMetrics(period: "7d" | "30d" = "7d"): Promise<DashboardMetrics> {
    const params = new URLSearchParams({ period })
    return apiRequest<DashboardMetrics>(`${API_ENDPOINTS.DASHBOARD.METRICS}?${params.toString()}`)
  },

  async getTicketTrends(days = 30): Promise<TicketTrend[]> {
    const params = new URLSearchParams({ days: days.toString() })
    return apiRequest<TicketTrend[]>(`${API_ENDPOINTS.DASHBOARD.TRENDS}?${params.toString()}`)
  },

  async getCategoryMetrics(): Promise<CategoryMetric[]> {
    return apiRequest<CategoryMetric[]>(API_ENDPOINTS.DASHBOARD.CATEGORIES)
  },

  async getAgentPerformance(): Promise<AgentPerformance[]> {
    return apiRequest<AgentPerformance[]>(API_ENDPOINTS.DASHBOARD.AGENTS)
  },
}

// User Service
export const UserService = {
  async getUsers(): Promise<User[]> {
    return apiRequest<User[]>(API_ENDPOINTS.USERS.LIST)
  },
}
