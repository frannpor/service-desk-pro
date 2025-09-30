"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { TicketList } from "@/components/tickets/ticket-list"
import { CreateTicketButton } from "@/components/tickets/create-ticket-button"
import { Ticket } from "lucide-react"

export default function MyTicketsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          </div>
          <p className="text-muted-foreground">View and manage all your support requests in one place</p>
        </div>
        <CreateTicketButton />
      </div>

      <TicketList />
    </div>
  )
}
