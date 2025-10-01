"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreateTicketForm } from "@/src/components/tickets/create-ticket-form"
import { Button } from "@/src/components/ui/Button"
import { ArrowLeft } from "lucide-react"

export default function NewTicketPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push("/tickets")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Ticket</h1>
        <p className="text-muted-foreground">Submit a support request and we'll get back to you soon.</p>
      </div>

      <CreateTicketForm />
    </div>
  )
}
