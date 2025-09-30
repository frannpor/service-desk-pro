"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Search, X, Filter } from "lucide-react"
import { useSession } from "next-auth/react"
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants/ticket"

interface TicketFiltersProps {
  filters: {
    status?: string[]
    priority?: string
    assignedTo?: string
    category?: string
    search?: string
  }
  onFiltersChange: (filters: any) => void
}

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps) {
  const { data: session } = useSession()
  const [searchInput, setSearchInput] = useState(filters.search || "")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const toggleStatus = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]

    onFiltersChange({ ...filters, status: newStatuses })
  }

  const clearFilters = () => {
    setSearchInput("")
    onFiltersChange({})
  }

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    filters.priority ||
    filters.assignedTo ||
    filters.category ||
    filters.search

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {(filters.status?.length || 0) + (filters.priority ? 1 : 0) + (filters.assignedTo ? 1 : 0)}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={filters.status?.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, priority: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment Filter (only for agents/managers) */}
              {session?.user.role !== "REQUESTER" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignment</label>
                  <Select
                    value={filters.assignedTo || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, assignedTo: value === "all" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All tickets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tickets</SelectItem>
                      <SelectItem value="me">Assigned to me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
