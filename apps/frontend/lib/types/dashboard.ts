import type { Ticket } from "./ticket"

export interface DashboardMetrics {
  period: "7d" | "30d"
  metrics: {
    ticketVolume: {
      current: number
      previous: number
      change: number
    }
    slaCompliance: {
      firstResponse: number
      resolution: number
    }
    averageTimes: {
      firstResponse: number
      resolution: number
    }
    backlog: {
      total: number
      byAge: {
        "0-1d": number
        "1-3d": number
        "3-7d": number
        "7d+": number
      }
    }
  }
  alerts: {
    breached: Ticket[]
    atRisk: Ticket[]
  }
}

export interface TicketTrend {
  date: string
  created: number
  resolved: number
}

export interface CategoryMetric {
  categoryId: string
  categoryName: string
  ticketCount: number
}

export interface AgentPerformance {
  agentId: string
  agentName: string
  assignedTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  slaCompliance: number
}
