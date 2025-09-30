"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useAddComment } from "@/lib/hooks/useTickets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/TextArea"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Lock } from "lucide-react"
import type { TicketDetail } from "@/lib/types/ticket"
import { formatDate } from "@/utils"

interface TicketCommentsProps {
  ticket: TicketDetail
}

export function TicketComments({ ticket }: TicketCommentsProps) {
  const { data: session } = useSession()
  const addComment = useAddComment()
  const [newComment, setNewComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canAddInternalNotes = session?.user.role !== "REQUESTER"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await addComment.mutateAsync({
        ticketId: ticket.id,
        data: {
          content: newComment,
          isInternal,
        },
      })
      setNewComment("")
      setIsInternal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleComments = ticket.comments.filter((comment) => !comment.isInternal || session?.user.role !== "REQUESTER")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({visibleComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canAddInternalNotes && (
                <Button
                  type="button"
                  variant={isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(!isInternal)}
                  className="gap-2"
                >
                  <Lock className="h-3 w-3" />
                  Internal Note
                </Button>
              )}
            </div>
            <Button type="submit" disabled={!newComment.trim() || isSubmitting} className="gap-2">
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {visibleComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          ) : (
            visibleComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 rounded-lg border bg-card">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(new Date(comment.createdAt))}
                    </span>
                    {comment.isInternal && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Lock className="h-2 w-2" />
                        Internal
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
