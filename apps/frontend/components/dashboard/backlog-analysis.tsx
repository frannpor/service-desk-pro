"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { useDashboardMetrics } from "@/lib/hooks/useDashboard"
import { Clock, AlertCircle } from "lucide-react"

export function BacklogAnalysis() {
  const { data: metrics, isLoading } = useDashboardMetrics("7d")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backlog Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading backlog data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const backlog = metrics.metrics.backlog
  const totalTickets = backlog.total

  const ageData = [
    { label: "0-1 day", count: backlog.byAge["0-1d"], color: "bg-green-500", textColor: "text-green-600" },
    { label: "1-3 days", count: backlog.byAge["1-3d"], color: "bg-blue-500", textColor: "text-blue-600" },
    { label: "3-7 days", count: backlog.byAge["3-7d"], color: "bg-yellow-500", textColor: "text-yellow-600" },
    { label: "7+ days", count: backlog.byAge["7d+"], color: "bg-red-500", textColor: "text-red-600" },
  ]

  const oldTickets = backlog.byAge["7d+"]
  const oldTicketsPercentage = totalTickets > 0 ? ((oldTickets / totalTickets) * 100).toFixed(1) : "0"

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Backlog Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">Age distribution of open tickets</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Open</p>
            <p className="text-3xl font-bold">{totalTickets}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Aging Tickets</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-red-600">{oldTickets}</p>
              <Badge variant="destructive" className="text-xs">
                {oldTicketsPercentage}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Age distribution bars */}
        <div className="space-y-3">
          {ageData.map((item) => {
            const percentage = totalTickets > 0 ? (item.count / totalTickets) * 100 : 0
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className={item.textColor}>
                    {item.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Alert for old tickets */}
        {oldTickets > 0 && (
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                {oldTickets} ticket{oldTickets > 1 ? "s" : ""} older than 7 days
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                Consider prioritizing these tickets to reduce backlog age
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
