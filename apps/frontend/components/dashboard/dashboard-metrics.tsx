"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { useDashboardMetrics } from "@/lib/hooks/useDashboard"
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Activity } from "lucide-react"

export function DashboardMetrics() {
  const [period, setPeriod] = useState<"7d" | "30d">("7d")

  const { data: metrics, isLoading, error } = useDashboardMetrics(period)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load metrics. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const getSLAStatus = (compliance: number) => {
    if (compliance >= 90) return { color: "text-green-600", bg: "bg-green-50 dark:bg-green-950", label: "Excellent" }
    if (compliance >= 75) return { color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950", label: "Good" }
    return { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950", label: "Needs Attention" }
  }

  const firstResponseStatus = getSLAStatus(metrics.metrics.slaCompliance.firstResponse)
  const resolutionStatus = getSLAStatus(metrics.metrics.slaCompliance.resolution)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Key Metrics</h2>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === "7d"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === "30d"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Volume</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.metrics.ticketVolume.current}</div>
            <div className="flex items-center mt-2 text-xs">
              {metrics.metrics.ticketVolume.change > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+{metrics.metrics.ticketVolume.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">{metrics.metrics.ticketVolume.change}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${firstResponseStatus.bg}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Response SLA</CardTitle>
            <div className={`p-2 ${firstResponseStatus.bg} rounded-lg`}>
              <Clock className={`h-4 w-4 ${firstResponseStatus.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold ${firstResponseStatus.color}`}>
                {metrics.metrics.slaCompliance.firstResponse}%
              </div>
              <Badge variant="outline" className={firstResponseStatus.color}>
                {firstResponseStatus.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg: {formatTime(metrics.metrics.averageTimes.firstResponse)}
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${resolutionStatus.bg}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution SLA</CardTitle>
            <div className={`p-2 ${resolutionStatus.bg} rounded-lg`}>
              <CheckCircle className={`h-4 w-4 ${resolutionStatus.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold ${resolutionStatus.color}`}>
                {metrics.metrics.slaCompliance.resolution}%
              </div>
              <Badge variant="outline" className={resolutionStatus.color}>
                {resolutionStatus.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg: {formatTime(metrics.metrics.averageTimes.resolution)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.metrics.backlog.total}</div>
            <div className="grid grid-cols-2 gap-1 mt-3">
              {Object.entries(metrics.metrics.backlog.byAge).map(([age, count]) => (
                <div key={age} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{age}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
