"use client"
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { TicketService, ApiError } from "../services/api.service"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"
import type { 
  TicketQueryDto, 
  CreateTicketDto, 
  UpdateTicketDto, 
  CreateCommentDto 
} from "../types/ticket"
import { useCallback, useMemo } from "react"

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
  const { data: session } = useSession()

  const finalQuery = useMemo(() => {
    if (session?.user?.role === "REQUESTER") {
      return {
        ...query,
        createdBy: session.user.id,
      }
    }
    return query
  }, [query, session?.user?.role, session?.user?.id])

  return useQuery({
    queryKey: ticketKeys.list(finalQuery),
    queryFn: () => TicketService.getTickets(finalQuery),
    enabled: !!session,
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.SHORT,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    select: (data) => ({
      ...data,
      hasMore: data.pagination.page < data.pagination.totalPages,
    }),
  })
}

export function useInfiniteTickets(query: Omit<TicketQueryDto, "page"> = {}) {
  const { data: session } = useSession()

  const finalQuery = useMemo(() => {
    if (session?.user?.role === "REQUESTER") {
      return {
        ...query,
        createdBy: session.user.id,
      }
    }
    return query
  }, [query, session?.user?.role, session?.user?.id])

  return useInfiniteQuery({
    queryKey: ticketKeys.infinite(finalQuery),
    queryFn: ({ pageParam = 1 }) => 
      TicketService.getTickets({ ...finalQuery, page: pageParam }),
    enabled: !!session,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.MEDIUM,
  })
}

export function useTicket(id: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => TicketService.getTicketById(id),
    enabled: !!id && !!session,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.setQueryData(ticketKeys.detail(data.id), data)
    },
    onError: (error) => {
      console.error("Create ticket error:", error)
    },
  })
}

// Mutation para actualizar ticket con optimistic updates
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDto }) => 
      TicketService.updateTicket(id, data),
    onMutate: async ({ id, data }) => {
      // Cancelar refetch en progreso
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(id) })
      
      // Snapshot del valor anterior
      const previousTicket = queryClient.getQueryData(ticketKeys.detail(id))

      // Optimistic update
      queryClient.setQueryData(ticketKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
        updatedAt: new Date().toISOString(),
      }))

      return { previousTicket, id }
    },
    onSuccess: (data) => {
      // Actualizar con la respuesta del servidor
      queryClient.setQueryData(ticketKeys.detail(data.id), data)
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousTicket && context?.id) {
        queryClient.setQueryData(ticketKeys.detail(context.id), context.previousTicket)
      }
      console.error("Update ticket error:", error)
    },
  })
}

// Mutation para agregar comentarios
export function useAddComment() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: CreateCommentDto }) =>
      TicketService.addComment(ticketId, data),
    onMutate: async ({ ticketId, data }) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) })
      const previousTicket = queryClient.getQueryData(ticketKeys.detail(ticketId))

      // Optimistic update del comentario
      queryClient.setQueryData(ticketKeys.detail(ticketId), (old: any) => ({
        ...old,
        comments: [
          ...(old?.comments || []),
          {
            id: `temp-${Date.now()}`,
            content: data.content,
            isInternal: data.isInternal || false,
            createdAt: new Date().toISOString(),
            author: {
              id: session?.user?.id,
              name: session?.user?.name || "You",
              email: session?.user?.email,
              role: session?.user?.role,
            },
          },
        ],
      }))

      return { previousTicket, ticketId }
    },
    onSuccess: (_, variables) => {
      // Refetch para obtener datos reales del servidor
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

// Hook para prefetch (optimización)
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