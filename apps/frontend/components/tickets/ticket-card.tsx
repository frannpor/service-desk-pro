"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { SLABadge } from "./sla-badge"
import type { Ticket } from "@/lib/types/ticket"
import { formatDate } from "@/utils"

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{ticket.requester.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{ticket.requester.name}</span>
              </div>

              {ticket.agent && (
                <div className="flex items-center gap-2">
                  <span>→</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{ticket.agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{ticket.agent.name}</span>
                </div>
              )}

              <span>{ticket.category.name}</span>
              <span>{formatDate(new Date(ticket.createdAt))} ago</span>
            </div>

            <div className="flex items-center gap-2">
              <SLABadge slaStatus={ticket.slaStatus} className="text-xs" />
              {ticket._count?.comments && (
                <span className="text-xs text-muted-foreground">{ticket._count.comments} comments</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
