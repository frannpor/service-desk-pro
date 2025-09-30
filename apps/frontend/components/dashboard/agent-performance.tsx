"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@radix-ui/react-progress"
import { useAgentPerformance } from "@/lib/hooks/useDashboard"
import { Users, Award } from "lucide-react"

export function AgentPerformance() {
  const { data: agents, isLoading } = useAgentPerformance()

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const getSLABadgeVariant = (compliance: number): "default" | "secondary" | "destructive" => {
    if (compliance >= 90) return "default"
    if (compliance >= 75) return "secondary"
    return "destructive"
  }

  const getSLAColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600"
    if (compliance >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading agent performance...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find top performer
  const topPerformer =
    agents && agents.length > 0
      ? agents.reduce((top, agent) => (agent.slaCompliance > top.slaCompliance ? agent : top))
      : null

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Performance
          </div>
          {agents && agents.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {agents.length} Agent{agents.length > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Team productivity and SLA compliance</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents && agents.length > 0 ? (
            agents.map((agent) => {
              const resolutionRate =
                agent.assignedTickets > 0 ? (agent.resolvedTickets / agent.assignedTickets) * 100 : 0
              const isTopPerformer = topPerformer?.agentId === agent.agentId

              return (
                <div
                  key={agent.agentId}
                  className={`p-4 border rounded-lg hover:bg-muted/50 transition-all ${
                    isTopPerformer ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{agent.agentName}</h4>
                      {isTopPerformer && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Top Performer
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={getSLABadgeVariant(agent.slaCompliance)}
                      className={agent.slaCompliance >= 90 ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {agent.slaCompliance}% SLA
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Assigned</p>
                      <p className="text-lg font-bold">{agent.assignedTickets}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-lg font-bold text-green-600">{agent.resolvedTickets}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                      <p className="text-lg font-bold">{formatTime(agent.avgResolutionTime)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Resolution Rate</span>
                      <span className="font-medium">{resolutionRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={resolutionRate} className="h-2" />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="font-medium">No agent performance data available</p>
              <p className="text-sm text-muted-foreground mt-1">Data will appear once agents start resolving tickets</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
