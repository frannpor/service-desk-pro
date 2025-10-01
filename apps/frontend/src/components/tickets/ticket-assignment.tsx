"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useUpdateTicket } from "@/src/lib/hooks/useTickets"
import { useUsers } from "@/src/lib/hooks/useUsers"
import { Button } from "../ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog"
import { Label } from "../ui/Label"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useToast } from "@/src/hooks/useToast"
import type { TicketDetail } from "@/src/lib/types/ticket"

interface TicketAssignmentProps {
    ticket: TicketDetail
}

export function TicketAssignment({ ticket }: TicketAssignmentProps) {
    const { data: session } = useSession()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [selectedAgentId, setSelectedAgentId] = useState<string>("")

    const updateTicket = useUpdateTicket()
    const { data: users, isLoading: loadingUsers } = useUsers()

    const isAgent = session?.user?.role === "AGENT"
    const isManager = session?.user?.role === "MANAGER"
    const canAssign = isAgent || isManager
    const isAssignedToCurrentUser = ticket.agent?.id === session?.user?.id

    // Filter only agents
    const agents = users?.filter((user) => user.role === "AGENT") || []

    const handleSelfAssign = async () => {
        if (!session?.user?.id) return

        try {
            await updateTicket.mutateAsync({
                id: ticket.id,
                data: { agentId: session.user.id },
            })
            toast({
                title: "Ticket assigned",
                description: "You have been assigned to this ticket.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to assign ticket",
                variant: "destructive",
            })
        }
    }

    const handleReassign = async () => {
        if (!selectedAgentId) return

        try {
            await updateTicket.mutateAsync({
                id: ticket.id,
                data: { agentId: selectedAgentId },
            })
            toast({
                title: "Ticket reassigned",
                description: "The ticket has been reassigned successfully.",
            })
            setOpen(false)
            setSelectedAgentId("")
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reassign ticket",
                variant: "destructive",
            })
        }
    }

    const handleUnassign = async () => {
        try {
            await updateTicket.mutateAsync({
                id: ticket.id,
                data: { agentId: undefined },
            })
            toast({
                title: "Ticket unassigned",
                description: "The agent has been removed from this ticket.",
            })
            setOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to unassign ticket",
                variant: "destructive",
            })
        }
    }

    if (!canAssign) {
        return null
    }

    // Agent can self-assign if ticket is unassigned
    if (isAgent && !ticket.agent) {
        return (
            <Button onClick={handleSelfAssign} disabled={updateTicket.isPending} size="sm">
                {updateTicket.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <UserCheck className="mr-2 h-4 w-4" />
                )}
                Assign to Me
            </Button>
        )
    }

    // Manager can always reassign
    if (isManager) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={ticket.agent ? "outline" : "default"} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        {ticket.agent ? "Reassign" : "Assign Agent"}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ticket.agent ? "Reassign Ticket" : "Assign Ticket"}</DialogTitle>
                        <DialogDescription>
                            {ticket.agent
                                ? `Currently assigned to ${ticket.agent.name}. Select a new agent or unassign.`
                                : "Select an agent to assign this ticket."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="agent">Agent</Label>
                            {loadingUsers ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                                    <SelectTrigger id="agent">
                                        <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name} ({agent.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {ticket.agent && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleUnassign}
                                disabled={updateTicket.isPending}
                                className="sm:mr-auto bg-transparent"
                            >
                                Unassign
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReassign} disabled={!selectedAgentId || updateTicket.isPending}>
                            {updateTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ticket.agent ? "Reassign" : "Assign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return null
}
