"use client"

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { TicketService, ApiError } from "../services/api.service"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"
import type { TicketQueryDto, CreateTicketDto, UpdateTicketDto, CreateCommentDto } from "../types/ticket"
import { useCallback } from "react"

export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (filters: TicketQueryDto) => [...ticketKeys.lists(), filters] as const,
  infinite: (filters: TicketQueryDto) => [...ticketKeys.lists(), "infinite", filters] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  comments: (id: string) => [...ticketKeys.detail(id), "comments"] as const,
}

export function useTickets(query: TicketQueryDto = {}) {
  return useQuery({
    queryKey: ticketKeys.list(query),
    queryFn: () => TicketService.getTickets(query),
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.SHORT,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  })
}

export function useInfiniteTickets(query: Omit<TicketQueryDto, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ticketKeys.infinite(query),
    queryFn: ({ pageParam = 1 }) => TicketService.getTickets({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.MEDIUM,
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => TicketService.getTicketById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [404].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTicketDto) => TicketService.createTicket(data),
    onMutate: async (newTicket) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ticketKeys.lists() })

      // Snapshot previous value
      const previousTickets = queryClient.getQueryData(ticketKeys.lists())

      return { previousTickets }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.infinite({}) })

      // Set the new ticket data
      queryClient.setQueryData(ticketKeys.detail(data.id), data)
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTickets) {
        queryClient.setQueryData(ticketKeys.lists(), context.previousTickets)
      }
      console.error("Create ticket error:", error)
    },
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDto }) => TicketService.updateTicket(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(id) })

      // Snapshot previous value
      const previousTicket = queryClient.getQueryData(ticketKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(ticketKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
      }))

      return { previousTicket, id }
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(ticketKeys.detail(data.id), data)

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.infinite({}) })
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTicket && context?.id) {
        queryClient.setQueryData(ticketKeys.detail(context.id), context.previousTicket)
      }
      console.error("Update ticket error:", error)
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: CreateCommentDto }) =>
      TicketService.addComment(ticketId, data),
    onMutate: async ({ ticketId, data }) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) })

      const previousTicket = queryClient.getQueryData(ticketKeys.detail(ticketId))

      // Optimistically add comment
      queryClient.setQueryData(ticketKeys.detail(ticketId), (old: any) => ({
        ...old,
        comments: [
          ...(old?.comments || []),
          {
            id: `temp-${Date.now()}`,
            content: data.content,
            createdAt: new Date().toISOString(),
            author: { name: "You" }, // Placeholder
          },
        ],
      }))

      return { previousTicket, ticketId }
    },
    onSuccess: (_, variables) => {
      // Refetch to get real data
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.ticketId) })
    },
    onError: (error, variables, context) => {
      if (context?.previousTicket && context?.ticketId) {
        queryClient.setQueryData(ticketKeys.detail(context.ticketId), context.previousTicket)
      }
      console.error("Add comment error:", error)
    },
  })
}

export function usePrefetchTicket() {
  const queryClient = useQueryClient()

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ticketKeys.detail(id),
        queryFn: () => TicketService.getTicketById(id),
        staleTime: QUERY_STALE_TIME.SHORT,
      })
    },
    [queryClient],
  )
}
