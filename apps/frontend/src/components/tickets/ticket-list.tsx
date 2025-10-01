"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTickets } from "@/src/lib/hooks/useTickets"
import { TicketCard } from "./ticket-card"
import { TicketFilters } from "./ticket-filters"
import { Button } from "@/src/components/ui/Button"
import { Loader2, Inbox } from "lucide-react"
import { TicketStatus } from "@/src/lib/types/ticket"

export function TicketList() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState<{
    status?: TicketStatus[]
    priority?: string
    assignedTo?: string
    category?: string
    search?: string
    page?: number
  }>({
    page: 1,
  })

  const { data, isLoading, error } = useTickets(filters)

  const handleFiltersChange = (newFilters: any) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleLoadMore = () => {
    setFilters({ ...filters, page: (filters.page || 1) + 1 })
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load tickets. Please try again.</p>
      </div>
    )
  }

  const tickets = data?.tickets || []
  return (
    <div className="space-y-6">
      <TicketFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No tickets found</h3>
          <p className="text-muted-foreground">
            {session?.user.role === "REQUESTER"
              ? "You haven't created any tickets yet."
              : "No tickets match your current filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {/* {hasMore && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleLoadMore} variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )} */}
        </>
      )}
    </div>
  )
}
