"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card"
import { Badge } from "@/src/components/ui/badge"
import { Activity, Clock, AlertCircle } from "lucide-react"
import type { TicketDetail } from "@/src/lib/types/ticket"
import { formatDate } from "@/src/utils"

interface TicketActivityProps {
  ticket: TicketDetail
}

export function TicketActivity({ ticket }: TicketActivityProps) {
  const getSLABadgeVariant = (met: boolean, breached: boolean) => {
    if (met) return "default"
    if (breached) return "destructive"
    return "secondary"
  }

  const isFirstResponseBreached = !ticket.firstResponseAt && new Date() > new Date(ticket.firstResponseDue)
  const isResolutionBreached = !ticket.resolvedAt && new Date() > new Date(ticket.resolutionDue)

  return (
    <div className="space-y-6">
      {/* SLA Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            SLA Timelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">First Response</span>
              <Badge variant={getSLABadgeVariant(!!ticket.firstResponseAt, isFirstResponseBreached) as any}>
                {ticket.firstResponseAt ? "Met" : isFirstResponseBreached ? "Breached" : "Pending"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Due: {formatDate(new Date(ticket.firstResponseDue))}
            </p>
            {ticket.firstResponseAt && (
              <p className="text-xs text-green-600">
                Responded: {formatDate(new Date(ticket.firstResponseAt))}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Resolution</span>
              <Badge variant={getSLABadgeVariant(!!ticket.resolvedAt, isResolutionBreached) as any}>
                {ticket.resolvedAt ? "Met" : isResolutionBreached ? "Breached" : "Pending"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Due: {formatDate(new Date(ticket.resolutionDue))}
            </p>
            {ticket.resolvedAt && (
              <p className="text-xs text-green-600">
                Resolved: {formatDate(new Date(ticket.resolvedAt))}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      {ticket.auditLogs && ticket.auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticket.auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user.name} • {formatDate(new Date(log.createdAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
