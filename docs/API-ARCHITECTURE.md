# API Architecture Documentation

## Overview

The frontend API architecture follows a layered approach with clear separation of concerns:

1. **Constants Layer** (`lib/constants/api.ts`) - API endpoints and configuration
2. **Utils Layer** (`lib/utils/api.ts`) - Low-level HTTP client with error handling
3. **Services Layer** (`lib/services/api.service.ts`) - Business logic and API calls
4. **Hooks Layer** (`lib/hooks/`) - React Query hooks for state management
5. **Types Layer** (`lib/types/`) - TypeScript definitions

## Architecture Layers

### 1. Constants Layer

Defines all API endpoints and configuration in a centralized location:

\`\`\`typescript
export const API_ENDPOINTS = {
  AUTH: { LOGIN: "/auth/login", ... },
  TICKETS: { LIST: "/tickets", ... },
  CATEGORIES: { LIST: "/categories", ... },
  DASHBOARD: { METRICS: "/dashboard/metrics", ... },
}

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  TIMEOUT: 30000,
  RETRIES: 3,
}
\`\`\`

### 2. Utils Layer

Provides low-level HTTP utilities:

- `apiRequest<T>()` - Main request function with auth headers
- `fetchWithConfig()` - Fetch wrapper with timeout and retry logic
- `handleApiResponse<T>()` - Response parsing and error handling
- `ApiError` - Custom error class with status codes

### 3. Services Layer

Organized by domain (Auth, Ticket, Category, Dashboard, User):

\`\`\`typescript
export const TicketService = {
  async getTickets(query: TicketQueryDto): Promise<TicketListResponse> { ... },
  async getTicketById(id: string): Promise<TicketDetail> { ... },
  async createTicket(data: CreateTicketDto): Promise<TicketDetail> { ... },
  async updateTicket(id: string, data: UpdateTicketDto): Promise<TicketDetail> { ... },
  async addComment(ticketId: string, data: CreateCommentDto): Promise<Comment> { ... },
}
\`\`\`

### 4. Hooks Layer

React Query hooks for each service with proper cache management:

\`\`\`typescript
// Query hooks
export function useTickets(query: TicketQueryDto) { ... }
export function useTicket(id: string) { ... }

// Mutation hooks
export function useCreateTicket() { ... }
export function useUpdateTicket() { ... }
export function useAddComment() { ... }
\`\`\`

**Query Keys Pattern:**
\`\`\`typescript
export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (filters: TicketQueryDto) => [...ticketKeys.lists(), filters] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
}
\`\`\`

### 5. Types Layer

TypeScript definitions matching backend DTOs:

- `ticket.ts` - Ticket, Comment, AuditLog types and DTOs
- `category.ts` - Category and CustomField types
- `user.ts` - User, Auth types and DTOs
- `dashboard.ts` - Dashboard metrics and analytics types

## Authentication Flow

1. User logs in via `AuthService.login()`
2. Backend returns JWT token
3. Token stored in NextAuth session
4. `getAuthHeaders()` automatically adds token to all requests
5. On 401/403 errors, hooks trigger logout and redirect

## Error Handling

All API errors are wrapped in `ApiError` class:

\`\`\`typescript
try {
  await TicketService.createTicket(data)
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`)
  }
}
\`\`\`

React Query hooks handle errors automatically:
- Retry logic for transient failures
- Automatic logout on auth errors
- Error state exposed to components

## Cache Management

React Query provides intelligent caching:

- **Stale Time**: How long data is considered fresh
  - SHORT (1min) - Real-time data (tickets, dashboard)
  - MEDIUM (5min) - Semi-static data (user profile)
  - LONG (15min) - Static data (categories)

- **GC Time**: How long unused data stays in cache
  - Prevents memory leaks
  - Allows instant back navigation

- **Invalidation**: Mutations automatically invalidate related queries
  \`\`\`typescript
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
  }
  \`\`\`

## Usage Examples

### Fetching Data

\`\`\`typescript
function TicketList() {
  const { data, isLoading, error } = useTickets({ 
    status: [TicketStatus.OPEN],
    page: 1,
    limit: 10 
  })

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  
  return <TicketTable tickets={data.tickets} />
}
\`\`\`

### Creating Data

\`\`\`typescript
function CreateTicketForm() {
  const createTicket = useCreateTicket()

  const handleSubmit = async (data: CreateTicketDto) => {
    try {
      await createTicket.mutateAsync(data)
      toast.success("Ticket created!")
    } catch (error) {
      toast.error("Failed to create ticket")
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
\`\`\`

### Updating Data

\`\`\`typescript
function TicketDetail({ id }: { id: string }) {
  const { data: ticket } = useTicket(id)
  const updateTicket = useUpdateTicket()

  const handleStatusChange = (status: TicketStatus) => {
    updateTicket.mutate({ 
      id, 
      data: { status, lastUpdatedAt: ticket.updatedAt } 
    })
  }

  return <TicketView ticket={ticket} onStatusChange={handleStatusChange} />
}
\`\`\`

## Role-Based Access

The backend enforces role-based permissions. Frontend hooks handle errors gracefully:

- **REQUESTER**: Can only see their own tickets
- **AGENT**: Can see all tickets, update status, add comments
- **MANAGER**: Full access including categories and dashboard

## Best Practices

1. **Always use hooks** - Never call services directly from components
2. **Leverage query keys** - Use the key factories for consistency
3. **Handle loading states** - Show spinners/skeletons during fetches
4. **Handle errors** - Display user-friendly error messages
5. **Optimistic updates** - Update UI before server confirms (when appropriate)
6. **Invalidate carefully** - Only invalidate what changed to avoid unnecessary refetches

## Environment Variables

Required in `.env.local`:

\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
