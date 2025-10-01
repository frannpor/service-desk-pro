"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card"
import { FileText } from "lucide-react"
import type { TicketDetail } from "@/src/lib/types/ticket"

interface TicketDetailsProps {
  ticket: TicketDetail
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Description
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-foreground">{ticket.description}</p>
        </div>

        {ticket.customFieldValues && Object.keys(ticket.customFieldValues).length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Additional Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ticket.customFieldValues).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                  <dd className="text-sm font-medium mt-1">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
