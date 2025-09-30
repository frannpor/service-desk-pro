"use client"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateTicketButton() {
  const router = useRouter()

  return (
    <Button onClick={() => router.push("/tickets/new")} className="gap-2">
      <Plus className="h-4 w-4" />
      Create Ticket
    </Button>
  )
}
