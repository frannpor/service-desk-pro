"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { useCategoryMetrics } from "@/lib/hooks/useDashboard"
import { PieChart, Layers } from "lucide-react"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function CategoryDistribution() {
  const { data: categories, isLoading } = useCategoryMetrics()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Tickets by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading category data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Tickets by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No category data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = categories.reduce(
    (acc, cat, idx) => ({
      ...acc,
      [cat.categoryName]: {
        label: cat.categoryName,
        color: COLORS[idx % COLORS.length],
      },
    }),
    {},
  )

  const totalTickets = categories.reduce((sum, cat) => sum + cat.ticketCount, 0)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Tickets by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">Total: {totalTickets} tickets</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" className="text-xs" />
              <YAxis
                dataKey="categoryName"
                type="category"
                width={120}
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ticketCount" radius={[0, 4, 4, 0]}>
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category breakdown */}
        <div className="mt-4 space-y-2">
          {categories.map((cat, idx) => {
            const percentage = ((cat.ticketCount / totalTickets) * 100).toFixed(1)
            return (
              <div key={cat.categoryId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium">{cat.categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{cat.ticketCount}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
