import { Badge } from "@/src/components/ui/badge"
import { STATUS_COLORS, formatEnumValue } from "@/src/lib/constants/ticket"
import type { TicketStatus } from "@/src/lib/types/ticket"

interface StatusBadgeProps {
  status: TicketStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "default"

  return (
    <Badge variant={variant as any} className={className}>
      {formatEnumValue(status)}
    </Badge>
  )
}
