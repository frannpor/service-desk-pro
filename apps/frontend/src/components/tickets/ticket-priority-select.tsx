"use client"

import { useSession } from "next-auth/react"
import { useUpdateTicket } from "@/src/lib/hooks/useTickets"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@radix-ui/react-select"
import { Badge } from "../ui/badge"
import { useToast } from "@/src/hooks/useToast"
import type { TicketDetail, TicketPriority } from "@/src/lib/types/ticket"


interface TicketPrioritySelectProps {
  ticket: TicketDetail
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
}

export function TicketPrioritySelect({ ticket }: TicketPrioritySelectProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const updateTicket = useUpdateTicket()

  const isManager = session?.user?.role === "MANAGER"
  const canChangePriority = isManager

  const getPriorityVariant = (priority: TicketPriority) => {
    switch (priority) {
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

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!canChangePriority) return

    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        data: { priority: newPriority },
      })
      toast({
        title: "Priority updated",
        description: `Ticket priority changed to ${PRIORITY_LABELS[newPriority]}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update priority",
        variant: "destructive",
      })
    }
  }

  if (!canChangePriority) {
    return <Badge variant={getPriorityVariant(ticket.priority)}>{PRIORITY_LABELS[ticket.priority]}</Badge>
  }

  return (
    <Select value={ticket.priority} onValueChange={handlePriorityChange} disabled={updateTicket.isPending}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LOW">Low</SelectItem>
        <SelectItem value="MEDIUM">Medium</SelectItem>
        <SelectItem value="HIGH">High</SelectItem>
        <SelectItem value="CRITICAL">Critical</SelectItem>
      </SelectContent>
    </Select>
  )
}
