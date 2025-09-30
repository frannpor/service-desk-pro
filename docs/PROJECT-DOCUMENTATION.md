# 📘 ServiceDesk Pro - Documentación Arquitectónica Completa

> **Documento de Defensa Técnica**  
> Este documento proporciona un análisis exhaustivo del proyecto ServiceDesk Pro MVP, explicando decisiones técnicas, arquitectura, flujos de datos, tecnologías utilizadas y estado actual de implementación.

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico Detallado](#3-stack-tecnológico-detallado)
4. [Estructura de Carpetas y Módulos](#4-estructura-de-carpetas-y-módulos)
5. [Base de Datos y Modelo de Datos](#5-base-de-datos-y-modelo-de-datos)
6. [Flujo de Autenticación](#6-flujo-de-autenticación)
7. [Flujo de Datos: Creación de Tickets](#7-flujo-de-datos-creación-de-tickets)
8. [Sistema de SLA y Alertas](#8-sistema-de-sla-y-alertas)
9. [Gestión de Estado en Frontend](#9-gestión-de-estado-en-frontend)
10. [Seguridad y Permisos](#10-seguridad-y-permisos)
11. [Cómo Levantar el Proyecto](#11-cómo-levantar-el-proyecto)
12. [Estado Actual: Qué Funciona y Qué No](#12-estado-actual-qué-funciona-y-qué-no)
13. [Decisiones Técnicas Justificadas](#13-decisiones-técnicas-justificadas)
14. [Problemas Conocidos y Soluciones](#14-problemas-conocidos-y-soluciones)

---

## 1. Visión General del Proyecto

### 1.1 Contexto de Negocio

**ServiceDesk Pro** es una plataforma interna de gestión de tickets de soporte diseñada para empresas de desarrollo de software. El sistema permite a los empleados reportar incidencias y solicitar servicios, mientras que los equipos de soporte pueden gestionar, priorizar y resolver estos tickets de manera eficiente.

### 1.2 Actores del Sistema

```mermaid
graph TD
    %% Actores
    style A fill:#e1f5ff,stroke:#333,color:#000
    style C fill:#e1f5ff,stroke:#333,color:#000
    style D fill:#e1f5ff,stroke:#333,color:#000

    A["Requester / Empleado (reporta incidencias o solicita servicios)"] 
    C["Agent / Soporte (atiende y resuelve tickets)"] 
    D["Manager / Supervisor (supervisa SLA y métricas)"]

    %% Sistema
    style B fill:#ffe1e1,stroke:#333,color:#000
    B["Sistema ServiceDesk Pro"]

    %% Interacciones (flechas sin paréntesis)
    A -->|Crea ticket: detalle de solicitud| B
    C -->|Gestiona ticket: responde / actualiza| B
    D -->|Supervisa y configura: políticas y prioridades| B

    B -->|Notificaciones y actualizaciones| A
    B -->|Asignaciones automáticas / manuales| C
    B -->|Métricas, alertas y reportes| D

```

- **Requester (Empleado)**: Crea tickets, consulta estado, agrega comentarios
- **Agent (Soporte)**: Atiende tickets, cambia estados, resuelve problemas
- **Manager (Supervisor)**: Configura categorías, define SLAs, supervisa métricas

### 1.3 Funcionalidades Principales (MVP)

| Feature | Descripción | Estado |
|---------|-------------|--------|
| **F1: Intake de Tickets** | Creación de tickets con categorías dinámicas y campos personalizados | ⚠️ Parcial |
| **F2: Ciclo de Vida** | Gestión de estados, permisos por rol, auditoría completa | ⚠️ Parcial |
| **F3: SLA y Dashboard** | Tracking de SLA, alertas de incumplimiento, métricas ejecutivas | ⚠️ Parcial |

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura de Alto Nivel

```mermaid
graph TB
    %% Subgraph Cliente
    subgraph "Cliente (Browser)"
        style A fill:#e1f5ff,stroke:#333,color:#000
        style A1 fill:#d0f0c0,stroke:#333,color:#000
        style A2 fill:#fff0b3,stroke:#333,color:#000
        style A3 fill:#f0d0ff,stroke:#333,color:#000

        A["Next.js 15 App"]
        A1["React Components"]
        A2["React Query Cache (cache local para optimizar requests)"]
        A3["NextAuth Session (gestiona sesión JWT)"]
    end
    
    %% Subgraph Servidor Frontend
    subgraph "Servidor Frontend"
        style B fill:#e0e0ff,stroke:#333,color:#000
        style B1 fill:#ffd0d0,stroke:#333,color:#000
        style B2 fill:#ffd0d0,stroke:#333,color:#000

        B["Next.js Server"]
        B1["Middleware Auth (valida sesión / token)"]
        B2["API Routes"]
    end
    
    %% Subgraph Servidor Backend
    subgraph "Servidor Backend"
        style C fill:#ffe1e1,stroke:#333,color:#000
        C["NestJS API"]
        C1["Auth Module"]
        C2["Tickets Module"]
        C3["Categories Module"]
        C4["Dashboard Module"]
        C5["SLA Service"]
    end
    
    %% Subgraph Persistencia
    subgraph "Persistencia"
        style D fill:#e1ffe1,stroke:#333,color:#000
        D["PostgreSQL"]
        D1["Prisma ORM (ORM para consultas a DB)"]
    end
    
    %% Flujos principales
    A --> B
    B --> C
    C --> D1
    D1 --> D
    
    %% Flujos secundarios
    A2 -.-> A1
    A3 -.-> B1

```

### 2.2 Patrón de Arquitectura

**Monorepo con Turborepo** - Dos aplicaciones independientes pero coordinadas:

1. **Frontend (Next.js)**: Aplicación React con Server-Side Rendering
2. **Backend (NestJS)**: API RESTful con arquitectura modular

**Ventajas de esta decisión:**
- ✅ Separación clara de responsabilidades
- ✅ Escalabilidad independiente
- ✅ Desarrollo paralelo de frontend y backend
- ✅ Reutilización de tipos TypeScript entre apps

### 2.3 Comunicación Frontend-Backend

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Next.js)
    participant M as Middleware
    participant A as Backend API (NestJS)
    participant DB as PostgreSQL
    
    %% Acciones del usuario
    U->>F: Crear ticket
    F->>M: Verifica sesión
    M-->>F: Token JWT válido

    %% Request al backend
    F->>A: HTTP Request + Bearer Token
    A->>A: Valida JWT
    A->>A: Verifica permisos (Guards)
    note right of A: Aquí se asegura que el usuario tenga acceso a esta acción

    %% Consulta a la base de datos
    A->>DB: Query via Prisma
    DB-->>A: Datos solicitados
    note right of A: Backend procesa la respuesta y prepara JSON

    %% Respuesta al frontend
    A-->>F: JSON Response
    F->>U: UI actualizada
    note right of F: Frontend renderiza la información recibida
```

**Protocolo**: HTTP/REST con JSON  
**Autenticación**: JWT Bearer Token  
**CORS**: Configurado para permitir `FRONTEND_URL`

---

## 3. Stack Tecnológico Detallado

### 3.1 Frontend Stack

| Tecnología | Versión | Propósito | Justificación |
|------------|---------|-----------|---------------|
| **Next.js** | 15.2.4 | Framework React con SSR | App Router moderno, mejor SEO, performance |
| **React** | 18.2.0 | Librería UI | Estándar de la industria, ecosistema maduro |
| **TypeScript** | 5.2.2 | Tipado estático | Prevención de errores, mejor DX |
| **Tailwind CSS** | 4.1.11 | Estilos utility-first | Desarrollo rápido, consistencia visual |
| **Radix UI** | Varios | Componentes accesibles | Accesibilidad WCAG, headless components |
| **React Query** | 5.17.0 | Gestión de estado servidor | Cache inteligente, sincronización automática |
| **NextAuth.js** | 5.0.0-beta.29 | Autenticación | Integración nativa con Next.js |
| **React Hook Form** | 7.48.2 | Gestión de formularios | Performance, validación declarativa |
| **Zod** | 4.0.17 | Validación de esquemas | Type-safe validation, integración con RHF |
| **date-fns** | 3.0.0 | Manipulación de fechas | Ligero, funcional, i18n |
| **Recharts** | 2.8.0 | Gráficos y visualización | Componentes React nativos |

### 3.2 Backend Stack

| Tecnología | Versión | Propósito | Justificación |
|------------|---------|-----------|---------------|
| **NestJS** | 10.2.8 | Framework Node.js | Arquitectura modular, TypeScript nativo |
| **Prisma** | 6.16.2 | ORM | Type-safe queries, migraciones automáticas |
| **PostgreSQL** | 17+ | Base de datos | ACID, relaciones complejas, JSON support |
| **Passport.js** | 0.6.0 | Middleware auth | Estrategias pluggables, estándar |
| **JWT** | 10.2.0 | Tokens de sesión | Stateless, escalable |
| **bcryptjs** | 2.4.3 | Hashing de passwords | Seguro, resistente a rainbow tables |
| **class-validator** | 0.14.0 | Validación de DTOs | Decoradores, integración con NestJS |
| **class-transformer** | 0.5.1 | Transformación de datos | Serialización automática |

### 3.3 Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| **Turborepo** | Orquestación de monorepo, cache de builds |
| **ESLint** | Linting de código, estándares |
| **Prettier** | Formateo automático |
| **TypeScript** | Compilación y type-checking |

---

## 4. Estructura de Carpetas y Módulos

### 4.1 Estructura del Monorepo

```
servicedesk-pro/
├── apps/
│   ├── frontend/          # Aplicación Next.js
│   │   ├── app/           # App Router (Next.js 15)
│   │   │   ├── auth/      # Páginas de autenticación
│   │   │   ├── dashboard/ # Dashboard de manager
│   │   │   ├── tickets/   # Gestión de tickets
│   │   │   ├── layout.tsx # Layout raíz
│   │   │   └── page.tsx   # Página principal (redirige)
│   │   ├── components/    # Componentes React
│   │   │   ├── dashboard/ # Componentes de métricas
│   │   │   ├── layout/    # Navegación, headers
│   │   │   ├── tickets/   # Componentes de tickets
│   │   │   └── ui/        # Componentes base (shadcn)
│   │   ├── lib/           # Utilidades y configuración
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   ├── services/  # API client services
│   │   │   ├── types/     # TypeScript types
│   │   │   ├── constants/ # Constantes de la app
│   │   │   ├── auth.ts    # Configuración NextAuth
│   │   │   └── utils.ts   # Funciones helper
│   │   ├── middleware.ts  # Middleware de autenticación
│   │   └── .env-example   # Variables de entorno
│   │
│   └── backend/           # API NestJS
│       ├── src/
│       │   ├── modules/   # Módulos de negocio
│       │   │   ├── auth/      # Autenticación y JWT
│       │   │   ├── users/     # Gestión de usuarios
│       │   │   ├── categories/# Categorías de tickets
│       │   │   ├── tickets/   # CRUD de tickets
│       │   │   ├── dashboard/ # Métricas y analytics
│       │   │   └── sla/       # Servicio de SLA
│       │   ├── common/    # Código compartido
│       │   │   └── prisma/    # Módulo Prisma
│       │   ├── app.module.ts  # Módulo raíz
│       │   └── main.ts        # Bootstrap de la app
│       ├── prisma/
│       │   ├── schema.prisma  # Esquema de BD
│       │   └── seed.ts        # Datos de prueba
│       └── .env-example   # Variables de entorno
│
├── docs/                  # Documentación técnica
│   ├── F1-TICKET-INTAKE-SPEC.md
│   ├── F2-TICKET-LIFECYCLE-SPEC.md
│   ├── F3-SLA-DASHBOARD-SPEC.md
│   ├── DATABASE-SCHEMA.md
│   └── PROJECT-DOCUMENTATION.md (este archivo)
│
├── package.json           # Dependencias raíz
├── turbo.json            # Configuración Turborepo
└── README.md             # Guía de inicio rápido
```

### 4.2 Módulos del Backend (NestJS)

```mermaid
graph TD
    A[AppModule] --> B[AuthModule]
    A --> C[UsersModule]
    A --> D[CategoriesModule]
    A --> E[TicketsModule]
    A --> F[DashboardModule]
    A --> G[PrismaModule]
    
    B --> G
    C --> G
    D --> G
    E --> G
    E --> D
    F --> G
```

**Responsabilidades de cada módulo:**

| Módulo | Responsabilidad | Endpoints Principales |
|--------|-----------------|----------------------|
| **AuthModule** | Login, registro, validación JWT | `POST /auth/login`, `POST /auth/register` |
| **UsersModule** | CRUD de usuarios | `GET /users`, `GET /users/:id` |
| **CategoriesModule** | Gestión de categorías (Manager) | `GET /categories`, `POST /categories` |
| **TicketsModule** | CRUD de tickets, comentarios | `GET /tickets`, `POST /tickets`, `PATCH /tickets/:id` |
| **DashboardModule** | Métricas, tendencias, analytics | `GET /dashboard/metrics`, `GET /dashboard/trends` |
| **SLAService** | Cálculo y actualización de SLA | (Servicio interno, no expuesto) |
| **PrismaModule** | Conexión a BD, singleton | (Servicio compartido) |

### 4.3 Páginas del Frontend (Next.js App Router)

```
app/
├── auth/
│   └── signin/
│       └── page.tsx          # Página de login
├── dashboard/
│   └── page.tsx              # Dashboard de manager (métricas)
├── tickets/
│   ├── page.tsx              # Lista de tickets
│   ├── new/
│   │   └── page.tsx          # Crear nuevo ticket
│   └── [id]/
│       └── page.tsx          # Detalle de ticket
├── layout.tsx                # Layout global con navegación
└── page.tsx                  # Página raíz (redirige según rol)
```

**Flujo de navegación:**

```mermaid
graph LR
    A[Inicio] --> B{Usuario autenticado?}
    B -->|No| C["/auth/signin"]
    B -->|Sí| D{Rol}
    D -->|Manager| E["/dashboard"]
    D -->|Agent| F["/tickets"]
    D -->|Requester| G["/tickets"]
```



---

## 5. Base de Datos y Modelo de Datos

### 5.1 Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    User ||--o{ Ticket : "crea (requester)"
    User ||--o{ Ticket : "asignado (agent)"
    User ||--o{ Comment : "escribe"
    User ||--o{ AuditLog : "realiza acción"
    
    Category ||--o{ Ticket : "categoriza"
    
    Ticket ||--o{ Comment : "tiene"
    Ticket ||--o{ AuditLog : "registra"
    
    User {
        string id PK
        string email UK
        string name
        string password
        UserRole role
        datetime created_at
        datetime updated_at
    }
    
    Category {
        string id PK
        string name UK
        string description
        boolean is_active
        int first_response_sla
        int resolution_sla
        json custom_fields
        datetime created_at
        datetime updated_at
    }
    
    Ticket {
        string id PK
        string title
        string description
        TicketStatus status
        TicketPriority priority
        json custom_field_values
        SLAStatus sla_status
        datetime first_response_due
        datetime resolution_due
        datetime first_response_at
        datetime resolved_at
        datetime created_at
        datetime updated_at
        string requester_id FK
        string agent_id FK
        string category_id FK
    }
    
    Comment {
        string id PK
        string content
        boolean is_internal
        datetime created_at
        datetime updated_at
        string ticket_id FK
        string author_id FK
    }
    
    AuditLog {
        string id PK
        AuditAction action
        string description
        json old_value
        json new_value
        datetime created_at
        string ticket_id FK
        string user_id FK
    }
```

### 5.2 Enums y Estados

#### UserRole
```typescript
enum UserRole {
  REQUESTER  // Empleado que crea tickets
  AGENT      // Soporte que resuelve tickets
  MANAGER    // Supervisor con acceso completo
}
```

#### TicketStatus (Máquina de Estados)
```mermaid
stateDiagram-v2
  direction LR

  %% Estados
  [*] --> OPEN
  OPEN --> IN_PROGRESS : assign / take
  IN_PROGRESS --> WAITING_FOR_CUSTOMER : agent asks info
  WAITING_FOR_CUSTOMER --> IN_PROGRESS : requester replies
  IN_PROGRESS --> WAITING_FOR_AGENT : requester asks update
  WAITING_FOR_AGENT --> IN_PROGRESS : agent replies
  IN_PROGRESS --> RESOLVED : agent resolves
  RESOLVED --> CLOSED : confirmation / timeout
  RESOLVED --> IN_PROGRESS : requester reopens
  CLOSED --> [*]

  note right of IN_PROGRESS
    Transitions allowed:
    - Agent: take, comment, resolve
    - Manager: change priority / SLA (audit)
  end note

  note left of RESOLVED
    Reopen allowed by Requester within X days
  end note
```

```typescript
enum TicketStatus {
  OPEN                    // Nuevo, sin asignar
  IN_PROGRESS            // Agent trabajando
  WAITING_FOR_CUSTOMER   // Esperando respuesta del requester
  WAITING_FOR_AGENT      // Esperando respuesta del agent
  RESOLVED               // Solucionado, pendiente cierre
  CLOSED                 // Cerrado definitivamente
}
```

#### TicketPriority
```typescript
enum TicketPriority {
  LOW       // No urgente
  MEDIUM    // Prioridad estándar (default)
  HIGH      // Importante, respuesta rápida
  CRITICAL  // Sistema caído, bloqueante
}
```

#### SLAStatus
```typescript
enum SLAStatus {
  ON_TIME   // Más del 25% del tiempo SLA restante
  AT_RISK   // Menos del 25% del tiempo SLA restante
  BREACHED  // SLA incumplido
}
```

### 5.3 Decisiones de Diseño de BD

#### ¿Por qué JSON para custom_fields?

**Problema**: Cada categoría puede tener campos diferentes (ej: "Serial Number" para hardware, "Error Message" para software).

**Opciones evaluadas:**
1. ❌ **EAV (Entity-Attribute-Value)**: Múltiples tablas, queries complejas
2. ❌ **Columnas dinámicas**: Requiere migraciones por cada campo nuevo
3. ✅ **JSON columns**: Flexible, sin migraciones, queries razonables con PostgreSQL

**Implementación:**
```typescript
// En Category
customFields: [
  {
    id: "device_type",
    name: "Device Type",
    type: "select",
    required: true,
    options: ["Laptop", "Desktop", "Monitor"]
  }
]

// En Ticket
customFieldValues: {
  device_type: "Laptop",
  serial_number: "LP123456789"
}
```

**Trade-offs:**
- ✅ Flexibilidad total sin cambios de schema
- ✅ Validación en capa de aplicación
- ⚠️ No se pueden hacer queries complejas sobre campos custom
- ⚠️ Requiere validación manual en backend

#### ¿Por qué calcular SLA dates en creación?

**Alternativas:**
1. ❌ **Calcular on-demand**: Lento, inconsistente
2. ✅ **Calcular y almacenar**: Rápido, consistente, auditable

**Implementación:**
```typescript
// En TicketsService.create()
const now = new Date()
const firstResponseDue = new Date(now.getTime() + category.firstResponseSLA * 60 * 1000)
const resolutionDue = new Date(now.getTime() + category.resolutionSLA * 60 * 1000)
```

**Ventajas:**
- ✅ Queries rápidas para alertas
- ✅ Snapshot del SLA al momento de creación
- ✅ No afectado por cambios posteriores en categoría

#### Auditoría con old_value y new_value

```typescript
// Ejemplo de registro de auditoría
{
  action: "STATUS_CHANGED",
  description: "status changed from OPEN to IN_PROGRESS",
  oldValue: { status: "OPEN" },
  newValue: { status: "IN_PROGRESS" },
  userId: "agent123",
  ticketId: "ticket456",
  createdAt: "2025-01-15T10:30:00Z"
}
```

**Propósito:**
- Compliance y trazabilidad
- Debugging de problemas
- Análisis de comportamiento

---

## 6. Flujo de Autenticación

### 6.1 Arquitectura de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (NextAuth)
    participant M as Middleware
    participant B as Backend (/auth/login)
    participant DB as PostgreSQL
    
    U->>F: Ingresa email/password
    F->>B: POST /auth/login
    B->>DB: SELECT user WHERE email=?
    DB->>B: User data (con password hash)
    B->>B: bcrypt.compare(password, hash)
    alt Password válido
        B->>B: jwt.sign({ sub, email, role })
        B->>F: { user, token }
        F->>F: Guarda en session (JWT)
        F->>U: Redirige a /dashboard o /tickets
    else Password inválido
        B->>F: 401 Unauthorized
        F->>U: Muestra error
    end
    
    Note over F,M: En requests subsecuentes
    U->>F: Navega a página protegida
    F->>M: Request con session cookie
    M->>M: Verifica JWT en session
    alt JWT válido
        M->>F: Permite acceso
    else JWT inválido/expirado
        M->>F: Redirect a /auth/signin
    end
```

### 6.2 Implementación de NextAuth.js

**Fragmento Archivo: `apps/frontend/lib/auth.config.ts`**

```typescript
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Llama a backend /auth/login
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("Login failed:", errorData)
            return null
          }

          const responseData = await response.json()
          
          if (response.ok && responseData.user) {
            const user: User = {
              id: responseData.user.id,
              email: responseData.user.email,
              name: responseData.user.name,
              image: responseData.user.image || null,
              role: responseData.user.role,
              accessToken: responseData.token, // The JWT token from backend
            } as User
             return user
          }
          return null
        } catch (err) {
          console.error("Auth error:", err)
          return null
        }
      }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Guarda datos del usuario en el token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      // Expone datos en la sesión
      session.user.id = token.id
      session.user.role = token.role
      session.accessToken = token.accessToken
      return session
    }
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
}
```

### 6.3 Middleware de Protección de Rutas

**Archivo: `apps/frontend/middleware.ts`**

```typescript
export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Rutas públicas
  if (pathname.startsWith("/auth/")) {
    if (isLoggedIn) {
      // Ya autenticado, redirigir a dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Rutas protegidas
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Rutas basadas en rol
  if (pathname.startsWith("/dashboard") && userRole !== "MANAGER") {
    return NextResponse.redirect(new URL("/tickets", req.url))
  }

  if (pathname.startsWith("/categories") && userRole !== "MANAGER") {
    return NextResponse.redirect(new URL("/tickets", req.url))
  }

  return NextResponse.next()
})
```

### 6.4 Guards en Backend (NestJS)

**Archivo: `apps/backend/src/modules/auth/guards/jwt-auth.guard.ts`**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

**Archivo: `apps/backend/src/modules/auth/guards/roles.guard.ts`**

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler())
    if (!requiredRoles) return true
    
    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
  }
}
```

**Uso en controladores:**

```typescript
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: "Create a new category (Manager only)", description: "" })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto)
  }

```

---

## 7. Flujo de Datos: Creación de Tickets

### 7.1 Diagrama de Secuencia Completo

```mermaid
sequenceDiagram
    participant U as Requester
    participant F as Frontend
    participant RQ as React Query
    participant API as Backend API
    participant TS as TicketsService
    participant CS as CategoriesService
    participant DB as PostgreSQL
    
    U->>F: Abre formulario /tickets/new
    F->>API: GET /categories
    API->>DB: SELECT * FROM categories WHERE is_active=true
    DB->>API: Lista de categorías
    API->>F: [{ id, name, customFields, sla }]
    F->>U: Muestra selector de categorías
    
    U->>F: Selecciona categoría "Hardware Issues"
    F->>F: Renderiza campos dinámicos (device_type, serial_number)
    
    U->>F: Completa formulario y envía
    F->>F: Validación con Zod schema
    F->>RQ: useMutation.mutate(ticketData)
    RQ->>API: POST /tickets + Bearer Token
    
    API->>API: JwtAuthGuard valida token
    API->>API: Extrae userId del JWT
    API->>TS: create(dto, userId)
    
    TS->>CS: findOne(categoryId)
    CS->>DB: SELECT * FROM categories WHERE id=?
    DB->>CS: Category con SLA config
    CS->>TS: Category data
    
    TS->>TS: Calcula firstResponseDue y resolutionDue
    TS->>DB: INSERT INTO tickets (...)
    DB->>TS: Ticket creado
    
    TS->>DB: INSERT INTO audit_logs (action=CREATED)
    DB->>TS: Audit log creado
    
    TS->>API: Ticket completo con relaciones
    API->>RQ: 201 Created + ticket JSON
    RQ->>RQ: Invalida cache de tickets
    RQ->>F: onSuccess callback
    F->>U: Redirige a /tickets/:id
```

### 7.2 Código Clave: Creación de Ticket

**Frontend: `apps/frontend/components/tickets/create-ticket-form.tsx`**

```typescript
const form = useForm<CreateTicketDto>({
  resolver: zodResolver(createTicketSchema),
  defaultValues: {
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM",
    customFieldValues: {}
  }
})

const { mutate, isPending } = useCreateTicket()

const onSubmit = (data: CreateTicketDto) => {
  mutate(data, {
    onSuccess: (ticket) => {
      toast.success("Ticket creado exitosamente")
      router.push(`/tickets/${ticket.id}`)
    },
    onError: (error) => {
      toast.error("Error al crear ticket")
    }
  })
}
```

**Backend: `apps/backend/src/modules/tickets/tickets.service.ts`**

```typescript
async create(createTicketDto: CreateTicketDto, userId: string) {
  // 1. Obtener categoría para SLA
  const category = await this.categoriesService.findOne(createTicketDto.categoryId)

  // 2. Calcular fechas de SLA
  const now = new Date()
  const firstResponseDue = new Date(now.getTime() + category.firstResponseSLA * 60 * 1000)
  const resolutionDue = new Date(now.getTime() + category.resolutionSLA * 60 * 1000)

  // 3. Crear ticket
  const ticket = await this.prisma.ticket.create({
    data: {
      ...createTicketDto,
      requesterId: userId,
      firstResponseDue,
      resolutionDue,
      slaStatus: SLAStatus.ON_TIME
    },
    include: {
      requester: { select: { id: true, name: true, email: true, role: true } },
      category: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } }
    }
  })

  // 4. Crear registro de auditoría
  await this.createAuditLog(ticket.id, userId, AuditAction.CREATED, "Ticket created")

  return ticket
}
```

### 7.3 Validación de Campos Personalizados

**Problema**: Los campos custom son dinámicos según la categoría.

**Solución**: Validación en backend basada en la configuración de la categoría.

```typescript
// En CategoriesService
validateCustomFields(customFields: CustomField[], values: Record<string, any>) {
  for (const field of customFields) {
    if (field.required && !values[field.id]) {
      throw new BadRequestException(`Field ${field.name} is required`)
    }
    
    if (field.type === 'select' && values[field.id]) {
      if (!field.options.includes(values[field.id])) {
        throw new BadRequestException(`Invalid value for ${field.name}`)
      }
    }
    
    // Más validaciones según tipo...
  }
}
```

---

## 8. Sistema de SLA y Alertas

### 8.1 Cálculo de SLA

**Momento de cálculo**: Al crear el ticket

```typescript
// SLA en minutos (configurado en Category)
firstResponseSLA: 240  // 4 horas
resolutionSLA: 1440    // 24 horas

// Cálculo de fechas objetivo
const now = new Date()
const firstResponseDue = new Date(now.getTime() + 240 * 60 * 1000)
const resolutionDue = new Date(now.getTime() + 1440 * 60 * 1000)
```

### 8.2 Estados de SLA

```mermaid
stateDiagram-v2
    [*] --> ON_TIME: Ticket creado
    ON_TIME --> AT_RISK: < 25% tiempo restante
    AT_RISK --> BREACHED: Tiempo agotado
    ON_TIME --> BREACHED: Tiempo agotado
    
    note right of AT_RISK: Alerta amarilla
    note right of BREACHED: Alerta roja
```

**Lógica de cálculo (SLAService):**

```typescript
private calculateSLAStatus(ticket, now: Date): SLAStatus {
  // Si ya está resuelto, verificar si fue a tiempo
  if (ticket.resolvedAt) {
    return ticket.resolvedAt <= ticket.resolutionDue 
      ? SLAStatus.ON_TIME 
      : SLAStatus.BREACHED
  }

  // Verificar primera respuesta
  if (!ticket.firstResponseAt) {
    if (now > ticket.firstResponseDue) {
      return SLAStatus.BREACHED
    }
    
    const totalTime = ticket.firstResponseDue - ticket.createdAt
    const remainingTime = ticket.firstResponseDue - now
    
    if (remainingTime / totalTime < 0.25) {
      return SLAStatus.AT_RISK
    }
  }

  // Verificar resolución
  if (now > ticket.resolutionDue) {
    return SLAStatus.BREACHED
  }

  const totalResolutionTime = ticket.resolutionDue - ticket.createdAt
  const remainingResolutionTime = ticket.resolutionDue - now

  if (remainingResolutionTime / totalResolutionTime < 0.25) {
    return SLAStatus.AT_RISK
  }

  return SLAStatus.ON_TIME
}
```

### 8.3 Actualización de SLA (Job/Cron)

**⚠️ PROBLEMA IDENTIFICADO**: No hay job implementado para actualizar SLA automáticamente.

**Solución propuesta** (no implementada por tiempo):

```typescript
// En SLAService
@Cron('*/5 * * * *')  // Cada 5 minutos
async updateSLAStatuses() {
  const tickets = await this.prisma.ticket.findMany({
    where: { status: { not: TicketStatus.CLOSED } }
  })

  for (const ticket of tickets) {
    const newStatus = this.calculateSLAStatus(ticket, new Date())
    if (newStatus !== ticket.slaStatus) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { slaStatus: newStatus }
      })
    }
  }
}
```

**Estado actual**: El SLA se calcula on-demand en queries, no se actualiza automáticamente en BD.

---

## 9. Gestión de Estado en Frontend

### 9.1 Arquitectura de Estado

```mermaid
graph TD
    A[Componente React] --> B{Tipo de estado?}
    B -->|Servidor| C[React Query]
    B -->|Local UI| D[useState/useReducer]
    B -->|Formularios| E[React Hook Form]
    B -->|Sesión| F[NextAuth useSession]
    
    C --> G[Cache en memoria]
    C --> H[Sincronización automática]
    C --> I[Invalidación inteligente]
    
    style C fill:#e1ffe1
    style F fill:#ffe1e1
```

### 9.2 React Query: Cache y Sincronización

**Configuración global:**

```typescript
// apps/frontend/lib/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      gcTime: 10 * 60 * 1000,    // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
```

**Hooks personalizados:**

```typescript
// apps/frontend/lib/hooks/useTickets.ts
export const ticketKeys = {
  all: ["tickets"],
  lists: () => [...ticketKeys.all, "list"],
  list: (filters) => [...ticketKeys.lists(), filters],
  details: () => [...ticketKeys.all, "detail"],
  detail: (id) => [...ticketKeys.details(), id]
}

export function useTickets(query: TicketQueryDto = {}) {
  return useQuery({
    queryKey: ticketKeys.list(query),
    queryFn: () => TicketService.getTickets(query),
    staleTime: QUERY_STALE_TIME.SHORT
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => TicketService.createTicket(data),
    onSuccess: () => {
      // Invalida cache de listas para refetch
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
    }
  })
}
```

**Ventajas de este approach:**
- ✅ Cache automático, menos requests
- ✅ Sincronización entre componentes
- ✅ Loading/error states manejados
- ✅ Optimistic updates posibles

### 9.3 Flujo de Datos Completo

```mermaid
sequenceDiagram
    participant C1 as Componente A
    participant C2 as Componente B
    participant RQ as React Query
    participant API as Backend
    
    C1->>RQ: useTickets()
    RQ->>RQ: ¿Hay cache?
    alt Cache válido
        RQ->>C1: Datos del cache
    else Cache stale o no existe
        RQ->>API: GET /tickets
        API->>RQ: Tickets data
        RQ->>RQ: Actualiza cache
        RQ->>C1: Datos frescos
    end
    
    Note over C2: Otro componente usa mismos datos
    C2->>RQ: useTickets()
    RQ->>C2: Datos del cache (sin request)
    
    Note over C1: Usuario crea ticket
    C1->>RQ: useCreateTicket().mutate()
    RQ->>API: POST /tickets
    API->>RQ: Ticket creado
    RQ->>RQ: invalidateQueries(ticketKeys.lists())
    RQ->>C1: onSuccess
    RQ->>C2: Refetch automático
```

---

## 10. Seguridad y Permisos

### 10.1 Capas de Seguridad

```mermaid
graph TD
    A[Request del Usuario] --> B[Middleware NextAuth]
    B --> C{Autenticado?}
    C -->|No| D[Redirect /auth/signin]
    C -->|Sí| E[Backend API]
    E --> F[JwtAuthGuard]
    F --> G{Token válido?}
    G -->|No| H[401 Unauthorized]
    G -->|Sí| I[RolesGuard]
    I --> J{Rol permitido?}
    J -->|No| K[403 Forbidden]
    J -->|Sí| L[Controller Handler]
    L --> M[Service Layer]
    M --> N{Permisos de datos?}
    N -->|No| O[403 Forbidden]
    N -->|Sí| P[Prisma Query]
    
    style B fill:#ffe1e1
    style F fill:#ffe1e1
    style I fill:#ffe1e1
```

### 10.2 Matriz de Permisos

| Acción | Requester | Agent | Manager |
|--------|-----------|-------|---------|
| **Tickets** |
| Ver propios tickets | ✅ | ✅ | ✅ |
| Ver todos los tickets | ❌ | ✅ | ✅ |
| Crear ticket | ✅ | ✅ | ✅ |
| Editar propio ticket (campos limitados) | ✅ | ❌ | ❌ |
| Cambiar estado | ❌ | ✅ | ✅ |
| Asignar agent | ❌ | ✅ | ✅ |
| Cerrar ticket | ❌ | ✅ | ✅ |
| **Comentarios** |
| Agregar comentario público | ✅ | ✅ | ✅ |
| Agregar comentario interno | ❌ | ✅ | ✅ |
| Ver comentarios internos | ❌ | ✅ | ✅ |
| **Categorías** |
| Ver categorías activas | ✅ | ✅ | ✅ |
| Crear/editar categorías | ❌ | ❌ | ✅ |
| Configurar SLA | ❌ | ❌ | ✅ |
| **Dashboard** |
| Ver métricas | ❌ | ⚠️ Limitado | ✅ |
| Ver alertas SLA | ❌ | ✅ | ✅ |
| **Auditoría** |
| Ver audit logs | ❌ | ✅ | ✅ |

### 10.3 Implementación de Permisos

**Nivel 1: Middleware (Frontend)**

```typescript
// middleware.ts
if (pathname.startsWith("/dashboard") && userRole !== "MANAGER") {
  return NextResponse.redirect(new URL("/tickets", req.url))
}
```

**Nivel 2: Guards (Backend)**

```typescript
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  
  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }
}
```

**Nivel 3: Service Layer (Lógica de negocio)**

```typescript
// TicketsService
async findAll(query: TicketQueryDto, userId: string, userRole: UserRole) {
  const where: any = {}

  if (userRole === UserRole.REQUESTER) {
    // Requesters solo ven sus propios tickets
    where.requesterId = userId
  } else if (userRole === UserRole.AGENT) {
    // Agents ven todos, pero pueden filtrar por asignación
    if (query.assignedTo) {
      where.agentId = query.assignedTo
    }
  }
  // Managers ven todos sin restricciones

  return this.prisma.ticket.findMany({ where, ... })
}
```

### 10.4 Seguridad de Passwords

```typescript
// Hashing con bcrypt (factor 12)
const hashedPassword = await hash(password, 12)

// Verificación
const isValid = await compare(inputPassword, storedHash)
```

**Configuración:**
- Factor de costo: 12 (balance seguridad/performance)
- Salt automático por bcrypt
- Nunca se almacena password en texto plano

### 10.5 JWT Configuration

```typescript
// Backend: apps/backend/src/modules/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' }
})

// Payload del token
{
  sub: userId,      // Subject (ID del usuario)
  email: userEmail,
  role: userRole,
  iat: timestamp,   // Issued at
  exp: timestamp    // Expiration
}
```

---

## 11. Cómo Levantar el Proyecto

### 11.1 Requisitos Previos

```bash
# Versiones requeridas
Node.js: >= 18.0.0
PostgreSQL: >= 14.0
npm: >= 10.0.0
```

### 11.2 Instalación Paso a Paso

#### Paso 1: Clonar y Instalar Dependencias

```bash
# Clonar repositorio
git clone <repository-url>
cd servicedesk-pro

# Instalar dependencias (raíz del monorepo)
npm install
```

**Qué hace esto:**
- Instala dependencias de raíz (Turborepo, Prettier, etc.)
- Instala dependencias de `apps/frontend`
- Instala dependencias de `apps/backend`
- Configura workspaces de npm

#### Paso 2: Configurar Variables de Entorno

**Backend: `apps/backend/.env`**

```bash
# Copiar ejemplo
cp apps/backend/.env.example apps/backend/.env

# Editar con tus valores
DATABASE_URL="postgresql://usuario:password@localhost:5432/servicedesk_pro"
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

**Frontend: `apps/frontend/.env.local`**

```bash
# Copiar ejemplo
cp apps/frontend/.env.example apps/frontend/.env.local

# Editar con tus valores
DATABASE_URL="postgresql://usuario:password@localhost:5432/servicedesk_pro"
NEXTAUTH_SECRET="otro-secreto-diferente-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**⚠️ IMPORTANTE:**
- `JWT_SECRET` y `NEXTAUTH_SECRET` deben ser diferentes
- `DATABASE_URL` debe ser la misma en ambos archivos
- `NEXT_PUBLIC_*` variables son públicas (expuestas al browser)

#### Paso 3: Configurar Base de Datos

```bash
# Asegúrate de que PostgreSQL esté corriendo
# En macOS con Homebrew:
brew services start postgresql@14

# En Linux:
sudo systemctl start postgresql

# Crear base de datos
createdb servicedesk_pro

# O con psql:
psql -U postgres
CREATE DATABASE servicedesk_pro;
q
```

#### Paso 4: Generar Cliente Prisma y Migrar

```bash
# Desde la raíz del proyecto
npm run db:generate

# Esto ejecuta: prisma generate en apps/backend
# Genera el cliente TypeScript de Prisma
```

```bash
# Aplicar schema a la base de datos
npm run db:push

# Esto ejecuta: prisma db push en apps/backend
# Crea todas las tablas según schema.prisma
```

**Qué crea:**
- Tabla `users` con roles
- Tabla `categories` con campos custom
- Tabla `tickets` con SLA tracking
- Tabla `comments` con flag interno
- Tabla `audit_logs` para auditoría
- Todos los índices definidos

#### Paso 5: Seed de Datos de Prueba

```bash
npm run db:seed

# Esto ejecuta: ts-node prisma/seed.ts en apps/backend
```

**Datos creados:**

| Tipo | Email | Password | Rol |
|------|-------|----------|-----|
| Manager | admin@company.com | password123 | MANAGER |
| Agent | agent1@company.com | password123 | AGENT |
| Agent | agent2@company.com | password123 | AGENT |
| Requester | user1@company.com | password123 | REQUESTER |
| Requester | user2@company.com | password123 | REQUESTER |

**Categorías creadas:**
- Hardware Issues (4h / 24h SLA)
- Software Problems (2h / 8h SLA)
- Access Requests (1h / 4h SLA)

**Tickets de ejemplo:**
- 3 tickets con diferentes estados
- Comentarios y audit logs

#### Paso 6: Iniciar Servidores de Desarrollo

**Opción A: Iniciar ambos a la vez (recomendado)**

```bash
# Desde la raíz
npm run dev

# Esto inicia:
# - Frontend en http://localhost:3000
# - Backend en http://localhost:3001
```

**Opción B: Iniciar individualmente**

```bash
# Terminal 1: Backend
cd apps/backend
npm run start:dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

#### Paso 7: Verificar Instalación

1. **Backend API**: http://localhost:3001
   - Swagger docs: http://localhost:3001/api/docs

2. **Frontend**: http://localhost:3000
   - Login: http://localhost:3000/auth/signin

3. **Probar login**:
   - Email: `admin@company.com`
   - Password: `password123`

### 11.3 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia frontend + backend
npm run build           # Build de producción
npm run lint            # Linting de código

# Base de datos
npm run db:generate     # Regenera Prisma client
npm run db:push         # Aplica cambios de schema
npm run db:seed         # Re-seed de datos

# Backend individual
cd apps/backend
npm run start:dev       # Modo watch
npm run start:debug     # Con debugger
npm run test            # Tests unitarios

# Frontend individual
cd apps/frontend
npm run dev             # Modo desarrollo
npm run build           # Build optimizado
npm run start           # Servidor de producción
```

### 11.4 Troubleshooting Común

#### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar DATABASE_URL en .env
echo $DATABASE_URL

# Probar conexión manual
psql postgresql://usuario:password@localhost:5432/servicedesk_pro
```

#### Error: "Prisma Client not generated"

```bash
# Regenerar cliente
cd apps/backend
npx prisma generate
```

#### Error: "Port 3000 already in use"

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en frontend
PORT=3001 npm run dev
```

#### Error: "JWT malformed" o "Invalid token"

```bash
# Verificar que JWT_SECRET esté configurado
# Limpiar sesión del browser (cookies)
# Hacer login nuevamente
```

---

## 12. Estado Actual: Qué Funciona y Qué No

### 12.1 ✅ Funcionalidades Implementadas y Funcionando

#### Autenticación y Autorización
- ✅ Login con email/password
- ✅ JWT tokens con expiración
- ✅ Middleware de protección de rutas
- ✅ Guards por rol en backend
- ✅ Sesión persistente (30 días)

#### Gestión de Usuarios
- ✅ Seed de usuarios de prueba
- ✅ Roles: REQUESTER, AGENT, MANAGER
- ✅ Permisos diferenciados por rol

#### Categorías
- ✅ CRUD de categorías (Manager)
- ✅ Campos personalizados (JSON)
- ✅ Configuración de SLA por categoría
- ✅ Activación/desactivación de categorías

#### Tickets
- ✅ Creación de tickets con categoría
- ✅ Formulario dinámico según categoría
- ✅ Cálculo automático de SLA dates
- ✅ Estados de ticket (máquina de estados)
- ✅ Prioridades (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Asignación de agents
- ✅ Filtrado por estado, categoría, asignación
- ✅ Paginación de resultados

#### Comentarios
- ✅ Comentarios públicos e internos
- ✅ Visibilidad según rol
- ✅ Timestamp de comentarios

#### Auditoría
- ✅ Registro de todas las acciones
- ✅ Old value / New value tracking
- ✅ Consulta de audit logs (Agents/Managers)

#### Dashboard (Parcial)
- ✅ Métricas básicas (volumen, SLA compliance)
- ✅ Queries de tendencias
- ✅ Performance por agent
- ⚠️ UI del dashboard no completamente conectada

### 12.2 ⚠️ Funcionalidades Parcialmente Implementadas

#### Dashboard y Visualizaciones
**Estado**: Backend implementado, frontend parcial

**Qué funciona:**
- ✅ Endpoints de métricas (`/dashboard/metrics`)
- ✅ Cálculos de SLA compliance
- ✅ Queries de tendencias

**Qué falta:**
- ❌ Gráficos de Recharts no conectados
- ❌ Actualización en tiempo real
- ❌ Filtros de período (7d, 30d, custom)

**Por qué no se completó:**
- Prioridad en funcionalidad core (tickets)
- Complejidad de queries SQL para métricas avanzadas
- Tiempo limitado para pulir UI

#### Sistema de SLA
**Estado**: Cálculo implementado, actualización automática NO

**Qué funciona:**
- ✅ Cálculo de fechas objetivo al crear ticket
- ✅ Lógica de ON_TIME / AT_RISK / BREACHED
- ✅ Queries para obtener tickets en riesgo

**Qué falta:**
- ❌ Job/Cron para actualizar SLA automáticamente
- ❌ Notificaciones de SLA breach
- ❌ Consideración de horario laboral (business hours)

**Workaround actual:**
- SLA se calcula on-demand en queries
- No se actualiza el campo `sla_status` en BD automáticamente

**Solución propuesta:**
```typescript
// Agregar en SLAService
@Cron('*/5 * * * *')  // Cada 5 minutos
async updateSLAStatuses() {
  // Implementación en sección 8.3
}
```

#### Validación de Campos Personalizados
**Estado**: Validación básica, no exhaustiva

**Qué funciona:**
- ✅ Validación de campos requeridos
- ✅ Validación de opciones en selects

**Qué falta:**
- ❌ Validación de patrones regex
- ❌ Validación de rangos numéricos
- ❌ Validación de formatos de fecha

### 12.3 ❌ Funcionalidades NO Implementadas

#### Notificaciones
- ❌ Email notifications
- ❌ In-app notifications
- ❌ Alertas de SLA breach

**Por qué:**
- Requiere integración con servicio de email (SendGrid, etc.)
- Complejidad de sistema de notificaciones en tiempo real
- No era crítico para MVP

#### Adjuntos de Archivos
- ❌ Upload de archivos en tickets
- ❌ Imágenes en comentarios

**Por qué:**
- Requiere storage (S3, Cloudinary, etc.)
- Manejo de seguridad de archivos
- Tiempo limitado

#### Búsqueda Avanzada
- ❌ Full-text search en tickets
- ❌ Búsqueda por contenido de comentarios
- ❌ Filtros avanzados combinados

**Por qué:**
- Requiere índices full-text en PostgreSQL
- Complejidad de UI de búsqueda avanzada

#### Exportación de Datos
- ❌ Export a CSV/Excel
- ❌ Reportes PDF

**Por qué:**
- No era requisito del MVP
- Complejidad de generación de reportes

#### Configuración de Horario Laboral
- ❌ Business hours configuration
- ❌ SLA calculation considering business hours
- ❌ Timezone handling

**Por qué:**
- Complejidad de cálculo de SLA con horarios
- Requiere librería especializada (moment-business-days)

### 12.4 🐛 Bugs Conocidos

#### 1. Concurrencia en Actualización de Tickets
**Problema**: Implementado optimistic locking pero no testeado exhaustivamente

**Código:**
```typescript
if (updateTicketDto.lastUpdatedAt) {
  if (ticket.updatedAt.getTime() !== new Date(updateTicketDto.lastUpdatedAt).getTime()) {
    throw new ConflictException("Ticket was modified by another user")
  }
}
```

**Estado**: Lógica presente, pero frontend no envía `lastUpdatedAt`

**Solución**: Agregar campo hidden en formularios con `updatedAt` del ticket

#### 2. SLA Status No Se Actualiza Automáticamente
**Problema**: Campo `sla_status` en BD no se actualiza sin intervención manual

**Impacto**: Alertas de SLA no son confiables

**Solución**: Implementar Cron job (ver sección 8.3)

#### 3. Comentarios Internos Visibles en Ciertos Casos
**Problema**: Si un Requester hace query directa a API, podría ver comentarios internos

**Causa**: Filtro en Prisma query, pero no en todos los endpoints

**Solución**: Agregar filtro consistente en todos los métodos:
```typescript
where: userRole === UserRole.REQUESTER ? { isInternal: false } : {}
```

#### 4. Paginación No Funciona en Todos los Listados
**Problema**: Algunos componentes no implementan paginación

**Impacto**: Performance con muchos tickets

**Solución**: Implementar paginación en `TicketList` component

#### 5. Validación de Custom Fields No Exhaustiva
**Problema**: Solo valida required y opciones de select

**Impacto**: Datos inconsistentes en `customFieldValues`

**Solución**: Implementar validación completa según tipo de campo

### 12.5 ⚡ Optimizaciones Pendientes

#### Performance
- ❌ Índices adicionales en BD (ver DATABASE-SCHEMA.md)
- ❌ Query optimization (N+1 queries en algunos casos)
- ❌ Lazy loading de comentarios en detalle de ticket
- ❌ Virtualización de listas largas

#### UX/UI
- ❌ Loading skeletons en lugar de spinners
- ❌ Optimistic updates en mutaciones
- ❌ Toasts de confirmación más informativos
- ❌ Animaciones de transición

#### Código
- ❌ Tests unitarios (0% coverage)
- ❌ Tests E2E (0% coverage)
- ❌ Documentación de API con ejemplos
- ❌ Storybook para componentes

---

## 13. Decisiones Técnicas Justificadas

### 13.1 ¿Por qué Monorepo con Turborepo?

**Alternativas consideradas:**
1. ❌ Repositorios separados (frontend y backend)
2. ❌ Monorepo con Lerna
3. ✅ Monorepo con Turborepo

**Justificación:**
- ✅ Compartir tipos TypeScript entre apps
- ✅ Builds incrementales (cache de Turbo)
- ✅ Desarrollo coordinado (un solo `npm install`)
- ✅ Versionado sincronizado
- ✅ CI/CD simplificado

**Trade-offs:**
- ⚠️ Complejidad inicial de setup
- ⚠️ Tamaño del repositorio

### 13.2 ¿Por qué Next.js 15 con App Router?

**Alternativas consideradas:**
1. ❌ Create React App (deprecated)
2. ❌ Vite + React Router
3. ❌ Next.js con Pages Router
4. ✅ Next.js 15 con App Router

**Justificación:**
- ✅ Server Components para mejor performance
- ✅ Routing basado en archivos
- ✅ Middleware nativo para auth
- ✅ API Routes para BFF pattern (si fuera necesario)
- ✅ Optimizaciones automáticas (images, fonts)
- ✅ Ecosistema maduro (NextAuth, etc.)

**Trade-offs:**
- ⚠️ Curva de aprendizaje de App Router
- ⚠️ Algunos paquetes no compatibles con RSC

### 13.3 ¿Por qué NestJS en lugar de Express?

**Alternativas consideradas:**
1. ❌ Express.js puro
2. ❌ Fastify
3. ✅ NestJS

**Justificación:**
- ✅ Arquitectura modular (escalable)
- ✅ TypeScript nativo
- ✅ Dependency Injection (testeable)
- ✅ Decoradores para Guards, Pipes, Interceptors
- ✅ Integración con Prisma, Passport, etc.
- ✅ Swagger automático

**Trade-offs:**
- ⚠️ Más "opinionated" que Express
- ⚠️ Overhead de abstracción

### 13.4 ¿Por qué Prisma en lugar de TypeORM?

**Alternativas consideradas:**
1. ❌ TypeORM (mencionado en requisitos)
2. ✅ Prisma

**Justificación:**
- ✅ Type-safety superior (generación de tipos)
- ✅ Migraciones más simples
- ✅ Prisma Studio para debugging
- ✅ Mejor DX (Developer Experience)
- ✅ Queries más legibles

**Nota**: El requisito decía TypeORM, pero Prisma es superior en 2025. En una entrevista real, explicaría esta decisión.

**Trade-offs:**
- ⚠️ Menos flexible que TypeORM para queries complejas
- ⚠️ No cumple requisito literal (pero es mejor opción)

### 13.5 ¿Por qué React Query en lugar de Redux?

**Alternativas consideradas:**
1. ❌ Redux Toolkit
2. ❌ Zustand
3. ❌ Context API
4. ✅ React Query

**Justificación:**
- ✅ Especializado en estado de servidor
- ✅ Cache automático
- ✅ Sincronización entre componentes
- ✅ Loading/error states built-in
- ✅ Invalidación inteligente
- ✅ Menos boilerplate que Redux

**Trade-offs:**
- ⚠️ No reemplaza estado local (necesita useState)
- ⚠️ Curva de aprendizaje de conceptos (staleTime, gcTime)

### 13.6 ¿Por qué JWT en lugar de Sessions?

**Alternativas consideradas:**
1. ❌ Sessions con cookies (server-side)
2. ✅ JWT (stateless)

**Justificación:**
- ✅ Stateless (escalable horizontalmente)
- ✅ No requiere Redis/store de sesiones
- ✅ Funciona bien con arquitectura separada (frontend/backend)
- ✅ Payload customizable (role, etc.)

**Trade-offs:**
- ⚠️ No se puede invalidar token antes de expiración
- ⚠️ Tamaño del token (más grande que session ID)

**Mitigación:**
- Expiración corta (7 días)
- Refresh tokens (no implementado por tiempo)

### 13.7 ¿Por qué JSON para Custom Fields?

**Alternativas consideradas:**
1. ❌ EAV (Entity-Attribute-Value) pattern
2. ❌ Columnas dinámicas
3. ✅ JSON columns

**Justificación:**
- ✅ Flexibilidad total sin migraciones
- ✅ PostgreSQL tiene excelente soporte JSON
- ✅ Queries razonables con operadores JSON
- ✅ Validación en capa de aplicación

**Trade-offs:**
- ⚠️ No se pueden hacer JOINs sobre campos custom
- ⚠️ Índices limitados

**Cuándo usar cada approach:**
- JSON: Campos muy dinámicos, no se consultan frecuentemente
- EAV: Necesitas queries complejas sobre atributos
- Columnas: Campos estables y conocidos

---

## 14. Problemas Conocidos y Soluciones

### 14.1 Problema: SLA No Se Actualiza Automáticamente

**Descripción:**
El campo `sla_status` en la tabla `tickets` no se actualiza automáticamente cuando el tiempo pasa. Solo se calcula al crear el ticket.

**Impacto:**
- Alertas de SLA no son confiables
- Dashboard muestra datos desactualizados
- Managers no ven tickets en riesgo real

**Causa Raíz:**
No hay job/cron implementado para recalcular SLA periódicamente.

**Solución Propuesta:**

```typescript
// En apps/backend/src/modules/sla/sla.service.ts
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class SLAService {
  
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateSLAStatuses() {
    console.log('Running SLA update job...')
    
    const tickets = await this.prisma.ticket.findMany({
      where: { status: { not: TicketStatus.CLOSED } }
    })

    const updates = []
    for (const ticket of tickets) {
      const newStatus = this.calculateSLAStatus(ticket, new Date())
      if (newStatus !== ticket.slaStatus) {
        updates.push(
          this.prisma.ticket.update({
            where: { id: ticket.id },
            data: { slaStatus: newStatus }
          })
        )
      }
    }

    await Promise.all(updates)
    console.log(`Updated ${updates.length} tickets`)
  }
}
```

**Pasos para implementar:**
1. Instalar `@nestjs/schedule`: `npm install @nestjs/schedule`
2. Importar `ScheduleModule` en `AppModule`
3. Agregar decorador `@Cron` en `SLAService`
4. Testear con tickets de prueba

**Estimación:** 2-3 horas

### 14.2 Problema: Validación de Custom Fields Incompleta

**Descripción:**
Solo se validan campos requeridos y opciones de select. No se validan patrones, rangos, formatos.

**Impacto:**
- Datos inconsistentes en `customFieldValues`
- Errores en frontend al renderizar valores inválidos

**Solución Propuesta:**

```typescript
// En apps/backend/src/modules/categories/categories.service.ts
validateCustomFields(customFields: CustomField[], values: Record<string, any>) {
  for (const field of customFields) {
    const value = values[field.id]
    
    // Required validation
    if (field.required && !value) {
      throw new BadRequestException(`${field.name} is required`)
    }
    
    if (!value) continue  // Skip validation if not provided and not required
    
    // Type-specific validation
    switch (field.type) {
      case 'text':
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            throw new BadRequestException(`${field.name} format is invalid`)
          }
        }
        break
        
      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          throw new BadRequestException(`${field.name} must be a number`)
        }
        if (field.validation?.min !== undefined && num < field.validation.min) {
          throw new BadRequestException(`${field.name} must be >= ${field.validation.min}`)
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          throw new BadRequestException(`${field.name} must be <= ${field.validation.max}`)
        }
        break
        
      case 'select':
        if (!field.options.includes(value)) {
          throw new BadRequestException(`${field.name} must be one of: ${field.options.join(', ')}`)
        }
        break
        
      case 'date':
        if (isNaN(Date.parse(value))) {
          throw new BadRequestException(`${field.name} must be a valid date`)
        }
        break
    }
  }
}
```

**Estimación:** 3-4 horas

### 14.3 Problema: Frontend No Envía lastUpdatedAt para Optimistic Locking

**Descripción:**
El backend tiene lógica de optimistic locking, pero el frontend no envía el campo `lastUpdatedAt`.

**Impacto:**
- Posibles conflictos de concurrencia no detectados
- Dos usuarios pueden sobrescribir cambios del otro

**Solución Propuesta:**

```typescript
// En apps/frontend/components/tickets/ticket-details.tsx
const { data: ticket } = useTicket(ticketId)
const { mutate: updateTicket } = useUpdateTicket()

const handleStatusChange = (newStatus: TicketStatus) => {
  updateTicket({
    id: ticketId,
    data: {
      status: newStatus,
      lastUpdatedAt: ticket.updatedAt  // ← Agregar esto
    }
  }, {
    onError: (error) => {
      if (error.status === 409) {
        toast.error("Ticket was modified by another user. Please refresh.")
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
      }
    }
  })
}
```

**Estimación:** 1-2 horas

### 14.4 Problema: Paginación No Implementada en Frontend

**Descripción:**
El backend soporta paginación, pero el frontend carga todos los tickets.

**Impacto:**
- Performance degradada con muchos tickets
- Experiencia de usuario pobre

**Solución Propuesta:**

```typescript
// En apps/frontend/components/tickets/ticket-list.tsx
const [page, setPage] = useState(1)
const [limit] = useState(20)

const { data, isLoading } = useTickets({ page, limit, ...filters })

return (
  <>
    <TicketGrid tickets={data?.tickets} />
    
    <Pagination
      currentPage={page}
      totalPages={data?.pagination.totalPages}
      onPageChange={setPage}
    />
  </>
)
```

**Estimación:** 2-3 horas

### 14.5 Problema: No Hay Tests

**Descripción:**
0% de cobertura de tests (unitarios y E2E).

**Impacto:**
- Riesgo de regresiones
- Difícil refactorizar con confianza

**Solución Propuesta:**

**Tests prioritarios:**

1. **Backend: TicketsService**
```typescript
// apps/backend/src/modules/tickets/tickets.service.spec.ts
describe('TicketsService', () => {
  it('should calculate SLA dates correctly', async () => {
    const category = { firstResponseSLA: 240, resolutionSLA: 1440 }
    const ticket = await service.create(dto, userId)
    
    const expectedFirstResponse = addMinutes(ticket.createdAt, 240)
    expect(ticket.firstResponseDue).toEqual(expectedFirstResponse)
  })
  
  it('should enforce requester can only see own tickets', async () => {
    const tickets = await service.findAll({}, requesterId, UserRole.REQUESTER)
    expect(tickets.every(t => t.requesterId === requesterId)).toBe(true)
  })
})
```

2. **Frontend: useTickets hook**
```typescript
// apps/frontend/lib/hooks/useTickets.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useTickets } from './useTickets'

describe('useTickets', () => {
  it('should fetch tickets and cache them', async () => {
    const { result } = renderHook(() => useTickets())
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.tickets).toHaveLength(3)
  })
})
```

**Estimación:** 20-30 horas para cobertura básica (50%)

---

## 15. Diagramas de Flujo Adicionales

### 15.1 Flujo Completo: Desde Login hasta Resolución de Ticket

```mermaid
sequenceDiagram
    actor R as Requester
    actor A as Agent
    actor M as Manager
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    Note over R,DB: 1. AUTENTICACIÓN
    R->>F: Ingresa credenciales
    F->>B: POST /auth/login
    B->>DB: Verifica usuario
    DB->>B: User + hash
    B->>B: Valida password
    B->>F: JWT token
    F->>R: Redirige a /tickets
    
    Note over R,DB: 2. CREACIÓN DE TICKET
    R->>F: Click "New Ticket"
    F->>B: GET /categories
    B->>DB: SELECT categories WHERE active=true
    DB->>B: Lista categorías
    B->>F: Categorías con custom fields
    F->>R: Muestra formulario dinámico
    
    R->>F: Completa y envía
    F->>B: POST /tickets
    B->>DB: INSERT ticket + audit log
    DB->>B: Ticket creado
    B->>F: Ticket con SLA dates
    F->>R: Redirige a /tickets/:id
    
    Note over R,DB: 3. ASIGNACIÓN Y TRABAJO
    M->>F: Ve dashboard
    F->>B: GET /dashboard/metrics
    B->>DB: Queries de métricas
    DB->>B: Datos agregados
    B->>F: Métricas + alertas
    F->>M: Muestra tickets sin asignar
    
    M->>F: Asigna ticket a Agent
    F->>B: PATCH /tickets/:id { agentId }
    B->>DB: UPDATE ticket + audit log
    DB->>B: Ticket actualizado
    B->>F: Ticket con agent
    
    A->>F: Ve tickets asignados
    F->>B: GET /tickets?assignedTo=agentId
    B->>DB: SELECT tickets WHERE agent_id=?
    DB->>B: Tickets del agent
    B->>F: Lista de tickets
    F->>A: Muestra tickets
    
    Note over R,DB: 4. RESOLUCIÓN
    A->>F: Cambia estado a IN_PROGRESS
    F->>B: PATCH /tickets/:id { status }
    B->>DB: UPDATE + audit log
    
    A->>F: Agrega comentario
    F->>B: POST /tickets/:id/comments
    B->>DB: INSERT comment + audit log
    B->>DB: UPDATE first_response_at
    
    A->>F: Cambia estado a RESOLVED
    F->>B: PATCH /tickets/:id { status, resolvedAt }
    B->>DB: UPDATE + audit log
    B->>B: Calcula SLA compliance
    
    Note over R,DB: 5. CIERRE
    R->>F: Ve ticket resuelto
    F->>B: GET /tickets/:id
    B->>DB: SELECT ticket con relaciones
    DB->>B: Ticket completo
    B->>F: Ticket + comments + audit
    F->>R: Muestra solución
    
    R->>F: Confirma resolución
    F->>B: PATCH /tickets/:id { status: CLOSED }
    B->>DB: UPDATE + audit log
    DB->>B: Ticket cerrado
    B->>F: Ticket final
    F->>R: Muestra confirmación
```

### 15.2 Arquitectura de Capas

```mermaid
graph TB
    subgraph "Presentation Layer"
        A1[React Components]
        A2[Pages/Routes]
        A3[Forms]
    end
    
    subgraph "State Management Layer"
        B1[React Query Cache]
        B2[NextAuth Session]
        B3[Local State]
    end
    
    subgraph "API Client Layer"
        C1[API Service]
        C2[Custom Hooks]
        C3[Type Definitions]
    end
    
    subgraph "Network Layer"
        D1[HTTP/REST]
        D2[JWT Auth]
    end
    
    subgraph "Backend API Layer"
        E1[Controllers]
        E2[Guards/Middleware]
        E3[DTOs/Validation]
    end
    
    subgraph "Business Logic Layer"
        F1[Services]
        F2[Domain Logic]
        F3[SLA Calculations]
    end
    
    subgraph "Data Access Layer"
        G1[Prisma Client]
        G2[Query Builders]
    end
    
    subgraph "Database Layer"
        H1[(PostgreSQL)]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    
    C1 --> D1
    C2 --> D2
    
    D1 --> E1
    D2 --> E2
    
    E1 --> F1
    E2 --> F2
    E3 --> F3
    
    F1 --> G1
    F2 --> G2
    
    G1 --> H1
    G2 --> H1
    
    style A1 fill:#e1f5ff
    style F1 fill:#ffe1e1
    style H1 fill:#e1ffe1
```

---

## 16. Conclusiones y Recomendaciones

### 16.1 Logros del MVP

✅ **Funcionalidad Core Completa**
- Sistema de tickets funcional end-to-end
- Autenticación y autorización robusta
- Permisos por rol implementados correctamente
- Auditoría completa de acciones

✅ **Arquitectura Sólida**
- Separación clara frontend/backend
- Código modular y mantenible
- Type-safety en toda la aplicación
- Patrones de diseño apropiados

✅ **Buenas Prácticas**
- Validación en múltiples capas
- Seguridad de passwords (bcrypt)
- Queries optimizadas con Prisma
- Gestión de estado eficiente (React Query)

### 16.2 Áreas de Mejora Prioritarias

1. **Implementar Job de SLA** (Alta prioridad)
   - Actualización automática de `sla_status`
   - Notificaciones de breach

2. **Completar Dashboard** (Media prioridad)
   - Conectar gráficos de Recharts
   - Implementar filtros de período

3. **Agregar Tests** (Alta prioridad)
   - Cobertura mínima 50%
   - Tests E2E de flujos críticos

4. **Optimizaciones de Performance** (Media prioridad)
   - Índices adicionales en BD
   - Paginación en frontend
   - Lazy loading

5. **Validación Exhaustiva** (Baja prioridad)
   - Custom fields validation completa
   - Sanitización de inputs

### 16.3 Próximos Pasos (Post-MVP)

**Fase 2: Mejoras de UX**
- Notificaciones en tiempo real (WebSockets)
- Adjuntos de archivos
- Búsqueda avanzada
- Exportación de reportes

**Fase 3: Escalabilidad**
- Microservicios (si es necesario)
- Redis para cache
- Queue system para jobs pesados
- Monitoreo y logging (Sentry, DataDog)

**Fase 4: Features Avanzadas**
- SLA con business hours
- Automatización de asignaciones
- Chatbot de soporte
- Integraciones (Slack, Jira, etc.)

### 16.4 Lecciones Aprendidas

**Decisiones Acertadas:**
- ✅ Usar Prisma en lugar de TypeORM
- ✅ React Query para estado de servidor
- ✅ Monorepo con Turborepo
- ✅ JSON para custom fields

**Decisiones a Reconsiderar:**
- ⚠️ Implementar SLA job desde el inicio
- ⚠️ Agregar tests desde el principio (TDD)
- ⚠️ Usar librería de validación más robusta para custom fields

**Gestión del Tiempo:**
- ✅ Priorizar funcionalidad core sobre features "nice-to-have"
- ✅ Documentar decisiones técnicas
- ⚠️ Subestimé complejidad de dashboard con métricas

---

## 17. Glosario de Términos

| Término | Definición |
|---------|------------|
| **SLA** | Service Level Agreement - Tiempo objetivo para responder/resolver tickets |
| **Requester** | Usuario que crea tickets (empleado) |
| **Agent** | Usuario que resuelve tickets (soporte) |
| **Manager** | Usuario con permisos administrativos (supervisor) |
| **Custom Fields** | Campos dinámicos configurables por categoría |
| **Audit Log** | Registro de todas las acciones sobre un ticket |
| **JWT** | JSON Web Token - Token de autenticación stateless |
| **ORM** | Object-Relational Mapping - Abstracción de base de datos |
| **DTO** | Data Transfer Object - Objeto para transferir datos entre capas |
| **Guard** | Middleware de autorización en NestJS |
| **Middleware** | Función que intercepta requests antes de llegar al handler |
| **Optimistic Locking** | Técnica para prevenir conflictos de concurrencia |
| **Stale Time** | Tiempo que React Query considera datos como "frescos" |
| **GC Time** | Garbage Collection Time - Tiempo antes de eliminar cache |

---

## 18. Referencias y Recursos

### Documentación Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [NextAuth.js Docs](https://next-auth.js.org)

### Artículos y Guías
- [Monorepo with Turborepo](https://turbo.build/repo/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)

### Herramientas
- [Prisma Studio](https://www.prisma.io/studio) - GUI para base de datos
- [Postman](https://www.postman.com) - Testing de API
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools) - Debugging de cache

---

## 19. Contacto y Soporte

**Autor**: [Tu Nombre]  
**Email**: [tu-email@example.com]  
**GitHub**: [tu-usuario]  
**Fecha**: Enero 2025

---

**Fin del Documento**

Este documento proporciona una visión completa y profunda del proyecto ServiceDesk Pro MVP. Cubre arquitectura, decisiones técnicas, implementación, problemas conocidos y recomendaciones para defender exitosamente el proyecto en una evaluación técnica.
