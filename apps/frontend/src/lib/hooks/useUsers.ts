"use client"

import { useQuery } from "@tanstack/react-query"
import { UserService, ApiError } from "../services/api.service"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"
import { useMemo } from "react"

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  byRole: (role: string) => [...userKeys.lists(), { role }] as const,
  agents: () => [...userKeys.byRole("AGENT")] as const,
  managers: () => [...userKeys.byRole("MANAGER")] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => UserService.getUsers(),
    staleTime: QUERY_STALE_TIME.LONG,
    gcTime: QUERY_GC_TIME.LONG,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useAgents() {
  const { data: users, ...rest } = useUsers()

  const agents = useMemo(() => {
    return users?.filter((user) => user.role === "AGENT") || []
  }, [users])

  return {
    data: agents,
    ...rest,
  }
}

export function useManagers() {
  const { data: users, ...rest } = useUsers()

  const managers = useMemo(() => {
    return users?.filter((user) => user.role === "MANAGER") || []
  }, [users])

  return {
    data: managers,
    ...rest,
  }
}

export function useUsersByRole(role?: string) {
  const { data: users, ...rest } = useUsers()

  const filteredUsers = useMemo(() => {
    if (!role) return users || []
    return users?.filter((user) => user.role === role) || []
  }, [users, role])

  return {
    data: filteredUsers,
    ...rest,
  }
}
