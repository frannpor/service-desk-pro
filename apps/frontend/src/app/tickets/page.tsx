"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { TicketList } from "@/src/components/tickets/ticket-list"
import { CreateTicketButton } from "@/src/components/tickets/create-ticket-button"

export default function TicketsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{session.user.role === "REQUESTER" ? "My Tickets" : "All Tickets"}</h1>
          <p className="text-muted-foreground">
            {session.user.role === "REQUESTER"
              ? "View and manage your support requests"
              : "Manage support tickets and help users"}
          </p>
        </div>
        <CreateTicketButton />
      </div>

      <TicketList />
    </div>
  )
}
