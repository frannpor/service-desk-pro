"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card"
import { Avatar, AvatarFallback } from "@/src/components/ui/Avatar"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { SLABadge } from "./sla-badge"
import type { Ticket } from "@/src/lib/types/ticket"
import { formatDate } from "@/src/utils"
import { MessageCircle } from "lucide-react"

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="ticket-card group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold leading-tight tracking-tight text-foreground group-hover:text-brand transition-colors line-clamp-2">
                {ticket.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {ticket.description}
              </p>
            </div>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-background">
                  <AvatarFallback className="text-xs bg-brand text-brand-foreground">
                    {ticket.requester.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{ticket.requester.name}</span>
              </div>

              {ticket.agent && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/50">→</span>
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarFallback className="text-xs bg-muted">
                      {ticket.agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{ticket.agent.name}</span>
                </div>
              )}

              <span className="px-2 py-1 bg-muted rounded-md text-xs">
                {ticket.category.name}
              </span>
              <span className="text-xs">
                {formatDate(new Date(ticket.createdAt))} ago
              </span>
            </div>

            <div className="flex items-center gap-3">
              <SLABadge slaStatus={ticket.slaStatus} className="text-xs" />
              {ticket._count?.comments && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <MessageCircle className="h-3 w-3" />
                  {ticket._count.comments}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}