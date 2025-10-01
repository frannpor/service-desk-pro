"use client"

import { useSession } from "next-auth/react"
import { useUpdateTicket } from "@/src/lib/hooks/useTickets"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@radix-ui/react-select"
import { useToast } from "@/src/hooks/useToast"
import type { TicketDetail, TicketStatus } from "@/src/lib/types/ticket"

interface TicketStatusSelectProps {
  ticket: TicketDetail
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_CUSTOMER: "Waiting for Customer",
  WAITING_FOR_AGENT: "Waiting for Agent",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

export function TicketStatusSelect({ ticket }: TicketStatusSelectProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const updateTicket = useUpdateTicket()

  const isAgent = session?.user?.role === "AGENT"
  const isManager = session?.user?.role === "MANAGER"
  const canChangeStatus = isAgent || isManager

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!canChangeStatus) return

    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        data: { status: newStatus },
      })
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${STATUS_LABELS[newStatus]}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  if (!canChangeStatus) {
    return <div className="font-medium">{STATUS_LABELS[ticket.status]}</div>
  }

  return (
    <Select value={ticket.status} onValueChange={handleStatusChange} disabled={updateTicket.isPending}>
      <SelectTrigger>
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
  )
}
