// Centralized ticket constants and color mappings

export const STATUS_COLORS = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  WAITING_FOR_CUSTOMER: "outline",
  WAITING_FOR_AGENT: "outline",
  RESOLVED: "default",
  CLOSED: "secondary",
} as const

export const PRIORITY_COLORS = {
  LOW: "outline",
  MEDIUM: "default",
  HIGH: "secondary",
  CRITICAL: "destructive",
} as const

export const SLA_COLORS = {
  ON_TIME: "default",
  AT_RISK: "secondary",
  BREACHED: "destructive",
} as const

export const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_CUSTOMER", label: "Waiting for Customer" },
  { value: "WAITING_FOR_AGENT", label: "Waiting for Agent" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const

export function formatEnumValue(value: string): string {
  return value.replace(/_/g, " ")
}
