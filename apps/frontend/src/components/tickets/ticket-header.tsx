"use client"

import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/Card"
import { Separator } from "../ui/Separator"
import { Clock, User, Tag, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { TicketAssignment } from "./ticket-assignment"
import { TicketStatusSelect } from "./ticket-status-select"
import { TicketPrioritySelect } from "./ticket-priority-select"
import type { TicketDetail } from "@/src/lib/types/ticket"
import { formatDistanceToNow } from "date-fns"
import { formatDate } from "@/src/utils"

interface TicketHeaderProps {
  ticket: TicketDetail
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const getSLAIcon = () => {
    switch (ticket.slaStatus) {
      case "ON_TIME":
        return <CheckCircle2 className="h-4 w-4" />
      case "AT_RISK":
        return <AlertTriangle className="h-4 w-4" />
      case "BREACHED":
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSLAVariant = () => {
    switch (ticket.slaStatus) {
      case "ON_TIME":
        return "default"
      case "AT_RISK":
        return "secondary"
      case "BREACHED":
        return "destructive"
    }
  }

  const getPriorityVariant = () => {
    switch (ticket.priority) {
      case "LOW":
        return "secondary"
      case "MEDIUM":
        return "default"
      case "HIGH":
        return "secondary"
      case "CRITICAL":
        return "destructive"
    }
  }

  const getStatusVariant = () => {
    switch (ticket.status) {
      case "OPEN":
        return "secondary"
      case "IN_PROGRESS":
        return "default"
      case "WAITING_FOR_CUSTOMER":
      case "WAITING_FOR_AGENT":
        return "secondary"
      case "RESOLVED":
        return "default"
      case "CLOSED":
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>#{ticket.id.slice(0, 8)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Created {formatDate(new Date(ticket.createdAt))}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>by {ticket.requester.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TicketAssignment ticket={ticket} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Status</span>
            </div>
            <TicketStatusSelect ticket={ticket} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Priority</span>
            </div>
            <TicketPrioritySelect ticket={ticket} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned To</span>
            </div>
            <div className="font-medium">
              {ticket.agent ? (
                <span>{ticket.agent.name}</span>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>SLA Status</span>
            </div>
            <Badge variant={getSLAVariant()} className="gap-1">
              {getSLAIcon()}
              {ticket.slaStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Category:</span>
            <span className="ml-2 font-medium">{ticket.category.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">First Response Due:</span>
            <span className="ml-2 font-medium">
              {formatDate(new Date(ticket.firstResponseDue))}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Resolution Due:</span>
            <span className="ml-2 font-medium">
              {formatDate(new Date(ticket.resolutionDue))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
