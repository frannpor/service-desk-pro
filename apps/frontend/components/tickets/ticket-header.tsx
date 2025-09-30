"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useUpdateTicket } from "@/lib/hooks/useTickets"
import { Card, CardContent } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Clock, User, Tag, CalendarDays } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { SLABadge } from "./sla-badge"
import type { TicketDetail } from "@/lib/types/ticket"
import { formatDate } from "@/utils"

interface TicketHeaderProps {
  ticket: TicketDetail
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const { data: session } = useSession()
  const updateTicket = useUpdateTicket()
  const [isUpdating, setIsUpdating] = useState(false)

  const canEdit = session?.user.role !== "REQUESTER"

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true)
    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        data: { status: status as any },
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    setIsUpdating(true)
    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        data: { priority: priority as any },
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Title and Badges */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
            <div className="flex flex-wrap gap-2">
              {canEdit ? (
                <>
                  <Select value={ticket.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_FOR_CUSTOMER">Waiting for Customer</SelectItem>
                      <SelectItem value="WAITING_FOR_AGENT">Waiting for Agent</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={ticket.priority} onValueChange={handlePriorityChange} disabled={isUpdating}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </>
              )}

              <SLABadge slaStatus={ticket.slaStatus} />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requester</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{ticket.requester.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{ticket.requester.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Assigned to</p>
                {ticket.agent ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{ticket.agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{ticket.agent.name}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{ticket.category.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {formatDate(new Date(ticket.createdAt))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
