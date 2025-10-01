import { Badge } from "@/src/components/ui/badge"
import { SLA_COLORS, formatEnumValue } from "@/src/lib/constants/ticket"
import { AlertCircle } from "lucide-react"
import type { SLAStatus } from "@/src/lib/types/ticket"

interface SLABadgeProps {
  slaStatus: SLAStatus | string
  showIcon?: boolean
  className?: string
}

export function SLABadge({ slaStatus, showIcon = true, className }: SLABadgeProps) {
  const variant = SLA_COLORS[slaStatus as keyof typeof SLA_COLORS] || "default"

  return (
    <Badge variant={variant as any} className={className}>
      {showIcon && <AlertCircle className="h-3 w-3 mr-1" />}
      SLA: {formatEnumValue(slaStatus)}
    </Badge>
  )
}
