"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTicket } from "@/src/lib/hooks/useTickets"
import { TicketHeader } from "@/src/components/tickets/ticket-header"
import { TicketDetails } from "@/src/components/tickets/ticket-details"
import { TicketComments } from "@/src/components/tickets/ticket-comments"
import { TicketActivity } from "@/src/components/tickets/ticket-activity"
import { Button } from "@/src/components/ui/Button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const ticketId = params.id as string

  const { data: ticket, isLoading, error } = useTicket(ticketId)

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Ticket not found</h2>
          <p className="text-muted-foreground mb-4">
            The ticket you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/tickets")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.push("/tickets")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="space-y-6">
        <TicketHeader ticket={ticket} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TicketDetails ticket={ticket} />
            <TicketComments ticket={ticket} />
          </div>

          <div className="space-y-6">
            <TicketActivity ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  )
}
