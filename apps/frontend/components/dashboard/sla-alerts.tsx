"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { useDashboardMetrics } from "@/lib/hooks/useDashboard"
import { AlertTriangle, Clock, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/utils"

export function SLAAlerts() {
  const { data: metrics, isLoading } = useDashboardMetrics("7d")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            SLA Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const alerts = metrics?.alerts

  const totalAlerts = (alerts?.breached?.length || 0) + (alerts?.atRisk?.length || 0)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            SLA Alerts
          </div>
          {totalAlerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalAlerts} Alert{totalAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {/* Breached SLAs */}
        {alerts?.breached && alerts.breached.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                SLA Breached
              </h4>
              <Badge variant="destructive">{alerts.breached.length}</Badge>
            </div>
            <div className="space-y-2">
              {alerts.breached.slice(0, 5).map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <Alert variant="destructive" className="cursor-pointer hover:bg-destructive/90 transition-all group">
                    <AlertDescription>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:underline">{ticket.title}</p>
                          <p className="text-sm mt-1">
                            {ticket.requester.name} • {ticket.category.name}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </AlertDescription>
                  </Alert>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* At Risk SLAs */}
        {alerts?.atRisk && alerts.atRisk.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                At Risk
              </h4>
              <Badge className="bg-yellow-500 hover:bg-yellow-600">{alerts.atRisk.length}</Badge>
            </div>
            <div className="space-y-2">
              {alerts.atRisk.slice(0, 5).map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <Alert className="cursor-pointer hover:bg-muted transition-all border-yellow-500/50 group">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:underline">{ticket.title}</p>
                          <p className="text-sm mt-1">
                            {ticket.requester.name} • {ticket.category.name}
                          </p>
                          {ticket.firstResponseDue && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {formatDate(new Date(ticket.firstResponseDue))}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </AlertDescription>
                  </Alert>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No alerts */}
        {(!alerts?.breached || alerts.breached.length === 0) && (!alerts?.atRisk || alerts.atRisk.length === 0) && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-lg">All SLAs are on track!</p>
            <p className="text-sm text-muted-foreground mt-1">No tickets require immediate attention</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
