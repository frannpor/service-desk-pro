"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardMetrics } from "@/src/components/dashboard/dashboard-metrics"
import { SLAAlerts } from "@/src/components/dashboard/sla-alerts"
import { TicketTrends } from "@/src/components/dashboard/ticket-trends"
import { AgentPerformance } from "@/src/components/dashboard/agent-performance"
import { CategoryDistribution } from "@/src/components/dashboard/category-distribution"
import { BacklogAnalysis } from "@/src/components/dashboard/backlog-analysis"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "MANAGER") {
    redirect("/tickets")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Monitor support operations, SLA compliance, and team performance
        </p>
      </div>

      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SLAAlerts />
        <TicketTrends />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistribution />
        <BacklogAnalysis />
      </div>

      <AgentPerformance />
    </div>
  )
}
