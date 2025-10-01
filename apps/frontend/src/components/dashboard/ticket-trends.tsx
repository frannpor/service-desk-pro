"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card"
import { Badge } from "@/src/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTicketTrends } from "@/src/lib/hooks/useDashboard"
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

  // Calculate totals
  const totalCreated = trends.reduce((sum, day) => sum + day.created, 0)
  const totalResolved = trends.reduce((sum, day) => sum + day.resolved, 0)
  const netChange = totalCreated - totalResolved

  // Colors defined directly
  const createdColor = "#3b82f6" // blue-500
  const resolvedColor = "#10b981" // green-500

  return (
    <Card className="dashboard-card">
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
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: createdColor }} />
            <span className="text-muted-foreground">Created: {totalCreated}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: resolvedColor }} />
            <span className="text-muted-foreground">Resolved: {totalResolved}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  const label = name === "created" ? "Created" : "Resolved"
                  return [value, label]
                }}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric",
                    year: "numeric"
                  })
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-foreground">
                    {value === "created" ? "Created" : "Resolved"}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke={createdColor}
                strokeWidth={3}
                dot={{ fill: createdColor, r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="created"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke={resolvedColor}
                strokeWidth={3}
                dot={{ fill: resolvedColor, r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}