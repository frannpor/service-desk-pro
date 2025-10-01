import { Badge } from "@/src/components/ui/badge"
import { PRIORITY_COLORS, formatEnumValue } from "@/src/lib/constants/ticket"
import type { TicketPriority } from "@/src/lib/types/ticket"

interface PriorityBadgeProps {
  priority: TicketPriority | string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variant = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "default"

  return (
    <Badge variant={variant as any} className={className}>
      {formatEnumValue(priority)}
    </Badge>
  )
}
