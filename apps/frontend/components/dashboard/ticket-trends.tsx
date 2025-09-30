"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { useTicketTrends } from "@/lib/hooks/useDashboard"
import { TrendingUp, Activity } from "lucide-react"

export function TicketTrends() {
  const { data: trends, isLoading } = useTicketTrends(14)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ticket Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading trends...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ticket Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    created: {
      label: "Created",
      color: "hsl(var(--chart-1))",
    },
    resolved: {
      label: "Resolved",
      color: "hsl(var(--chart-2))",
    },
  }

  // Calculate totals
  const totalCreated = trends.reduce((sum, day) => sum + day.created, 0)
  const totalResolved = trends.reduce((sum, day) => sum + day.resolved, 0)
  const netChange = totalCreated - totalResolved

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ticket Trends (14 Days)
          </div>
          <Badge variant={netChange > 0 ? "destructive" : "default"} className="text-xs">
            {netChange > 0 ? "+" : ""}
            {netChange} Net
          </Badge>
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span className="text-muted-foreground">Created: {totalCreated}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span className="text-muted-foreground">Resolved: {totalResolved}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="var(--color-created)"
                strokeWidth={2}
                dot={{ fill: "var(--color-created)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Created"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="var(--color-resolved)"
                strokeWidth={2}
                dot={{ fill: "var(--color-resolved)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
