import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ServiceDesk Pro utility functions
export function getStatusColor(status: string): string {
  const statusColors = {
    open: "ticket-status-open",
    "in-progress": "ticket-status-in-progress",
    resolved: "ticket-status-resolved",
    closed: "ticket-status-closed",
    escalated: "ticket-status-escalated",
  }
  return statusColors[status as keyof typeof statusColors] || "ticket-status-open"
}

export function getPriorityColor(priority: string): string {
  const priorityColors = {
    low: "priority-low",
    medium: "priority-medium",
    high: "priority-high",
    critical: "priority-critical",
  }
  return priorityColors[priority as keyof typeof priorityColors] || "priority-medium"
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "hace un momento"
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`
  return `hace ${Math.floor(diffInSeconds / 86400)} días`
}
