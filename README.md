# ServiceDesk Pro MVP

Una plataforma moderna de service desk interno para gestionar tickets de soporte con control de acceso basado en roles, seguimiento de SLA y auditoría completa.

## 🏗️ Arquitectura

Este es un monorepo **Turborepo** que contiene:

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: NestJS + Prisma + PostgreSQL
- **Shared**: Tipos TypeScript y utilidades compartidas

### Arquitectura de Deployment (Futura)

El proyecto está diseñado para un deployment híbrido:

- **Frontend**: Vercel (Next.js optimizado)
- **Backend**: AWS (ECS, Lambda, o EC2)
- **Base de Datos**: Supabase (PostgreSQL gestionado)
- **Assets**: Vercel Blob o S3

## 🚀 Guía de Inicio Rápido

### Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** 10+ (viene con Node.js)
- **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/download/))
  - O usa Docker para PostgreSQL (ver sección Docker más abajo)
- **Git** ([Descargar](https://git-scm.com/))

### Opción 1: Instalación Local (Desarrollo)

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd servicedesk-pro
```

#### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias del monorepo
npm install
```

Este comando instalará las dependencias para:
- El workspace raíz
- Frontend (`apps/frontend`)
- Backend (`apps/backend`)

#### 3. Configurar Variables de Entorno

**Backend** (`apps/backend/.env`):

```bash
# Copiar el archivo de ejemplo
cp apps/backend/.env.example apps/backend/.env

# Editar el archivo con tus valores
nano apps/backend/.env  # o usa tu editor favorito
```

Variables requeridas:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/servicedesk_pro"
JWT_SECRET="xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

**Frontend** (`apps/frontend/.env.local`):

```bash
# Copiar el archivo de ejemplo
cp apps/frontend/.env.example apps/frontend/.env.local

# Editar el archivo con tus valores
nano apps/frontend/.env.local
```

Variables requeridas:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/servicedesk_pro"
NEXTAUTH_SECRET="xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV=development
```

#### 4. Configurar la Base de Datos

**Opción A: PostgreSQL Local**

```bash
# Crear la base de datos
createdb servicedesk_pro

# O usando psql
psql -U postgres
CREATE DATABASE servicedesk_pro;
q
```

**Opción B: PostgreSQL con Docker**

```bash
# Iniciar PostgreSQL en Docker
docker run --name servicedesk-postgres 
  -e POSTGRES_PASSWORD=password 
  -e POSTGRES_DB=servicedesk_pro 
  -p 5432:5432 
  -d postgres:14
```

#### 5. Inicializar el Schema de la Base de Datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Aplicar el schema a la base de datos
npm run db:push

# Poblar con datos de ejemplo (usuarios, categorías, tickets)
npm run db:seed
```

#### 6. Iniciar los Servidores de Desarrollo

**Opción A: Iniciar todo junto**

```bash
npm run dev
```

Esto iniciará:
- Frontend en `http://localhost:3000`
- Backend en `http://localhost:3001`

**Opción B: Iniciar servicios individualmente**

Terminal 1 (Backend):
```bash
cd apps/backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd apps/frontend
npm run dev
```

#### 7. Acceder a la Aplicación

Abre tu navegador en `http://localhost:3000`

### Opción 2: Instalación con Docker Compose (Recomendado)

Docker Compose facilita el setup al manejar PostgreSQL, Backend y Frontend en contenedores.

#### 1. Prerequisitos Docker

- **Docker** ([Descargar](https://www.docker.com/get-started))
- **Docker Compose** (incluido con Docker Desktop)

#### 2. Crear docker-compose.yml

Crea un archivo `docker-compose.yml` en la raíz del proyecto:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: servicedesk-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: servicedesk_pro_db
      POSTGRES_USER: servicedesk_user
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - servicedesk-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U servicedesk_user -d servicedesk_pro_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: servicedesk-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://servicedesk_user:password@postgres:5433/servicedesk_pro_db
      JWT_SECRET: xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - servicedesk-network
    command: >
      sh -c "
        npx prisma db push --accept-data-loss &&
        npx prisma db seed &&
        node dist/main.js
      "

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: servicedesk-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - servicedesk-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: servicedesk-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@servicedesk.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - servicedesk-network
    profiles:
      - tools

volumes:
  postgres_data:
    driver: local

networks:
  servicedesk-network:
    driver: bridge
```

#### 3. Crear Dockerfiles

**Backend Dockerfile** (`apps/backend/Dockerfile`):

```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY apps/backend ./apps/backend
COPY prisma ./apps/backend/prisma

# Generar Prisma Client
RUN cd apps/backend && npx prisma generate

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start:dev", "--workspace=backend"]
```

**Frontend Dockerfile** (`apps/frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY turbo.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY apps/frontend ./apps/frontend

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "dev", "--workspace=frontend"]
```

#### 4. Iniciar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up -d --build
```

#### 5. Inicializar la Base de Datos

```bash
# Ejecutar migraciones dentro del contenedor del backend
docker-compose exec backend npm run db:push

# Poblar con datos de ejemplo
docker-compose exec backend npm run db:seed
```

#### 6. Acceder a los Servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

#### 7. Comandos Útiles de Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v

# Reconstruir un servicio específico
docker-compose up -d --build backend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 👥 Usuarios de Prueba

Después de ejecutar `npm run db:seed`, tendrás acceso a estas cuentas:

| Rol | Email | Password | Permisos |
|-----|-------|----------|----------|
| **Manager** | admin@company.com | password123 | Acceso completo, configuración, analytics |
| **Agent** | agent1@company.com | password123 | Gestionar tickets asignados, comentarios internos |
| **Requester** | user1@company.com | password123 | Crear tickets, ver propios tickets, comentarios |

### Permisos por Rol

- **Requester**: Crear tickets, ver sus propios tickets, agregar comentarios
- **Agent**: Gestionar tickets asignados, ver todos los tickets, comentarios internos
- **Manager**: Acceso completo, configurar categorías, ver analytics y dashboard

## 🎯 Funcionalidades Principales

### ✅ F1 - Intake de Tickets y Categorías
- Formularios dinámicos de creación de tickets basados en categorías
- Configuración de campos personalizados por managers
- Asignación automática de SLA según categoría

### ✅ F2 - Ciclo de Vida de Tickets y Auditoría
- Gestión completa del estado de tickets
- Permisos basados en roles
- Registro de auditoría completo
- Manejo de concurrencia

### ✅ F3 - Monitoreo de SLA y Dashboard
- Seguimiento de SLA en tiempo real con alertas
- Dashboard ejecutivo con métricas clave
- Analytics de rendimiento por agente/categoría

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 con App Router
- **Styling**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form + Zod validation
- **State**: React Query para estado del servidor
- **Auth**: NextAuth.js v5

### Backend  
- **Framework**: NestJS con TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT con Passport.js
- **Validation**: Class Validator + Class Transformer

## 📁 Estructura del Proyecto

```
servicedesk-pro/
├── apps/
│   ├── frontend/              # Aplicación Next.js
│   │   ├── app/               # App Router pages
│   │   │   ├── auth/          # Páginas de autenticación
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   └── tickets/       # Gestión de tickets
│   │   ├── components/        # Componentes UI reutilizables
│   │   │   ├── dashboard/     # Componentes del dashboard
│   │   │   ├── tickets/       # Componentes de tickets
│   │   │   ├── layout/        # Layout y navegación
│   │   │   └── ui/            # Componentes base (shadcn/ui)
│   │   ├── lib/               # Utilidades y configuraciones
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # Servicios API
│   │   │   ├── schemas/       # Schemas de validación Zod
│   │   │   └── types/         # Definiciones TypeScript
│   │   └── middleware.ts      # Middleware de Next.js
│   │
│   └── backend/               # API NestJS
│       ├── src/
│       │   ├── modules/       # Módulos de funcionalidades
│       │   │   ├── auth/      # Autenticación y autorización
│       │   │   ├── users/     # Gestión de usuarios
│       │   │   ├── tickets/   # Gestión de tickets
│       │   │   ├── categories/# Categorías de tickets
│       │   │   ├── dashboard/ # Métricas y analytics
│       │   │   └── sla/       # Cálculo y monitoreo de SLA
│       │   ├── common/        # Utilidades compartidas
│       │   │   └── prisma/    # Servicio de Prisma
│       │   └── main.ts        # Entry point
│       └── prisma/            # Schema y seeds de base de datos
│           ├── schema.prisma  # Definición del schema
│           └── seed.ts        # Datos de ejemplo
│
├── docs/                      # Especificaciones técnicas
│   ├── API-ARCHITECTURE.md    # Arquitectura de la API
│   ├── DATABASE-SCHEMA.md     # Schema de base de datos
│   ├── F1-TICKET-INTAKE-SPEC.md
│   ├── F2-TICKET-LIFECYCLE-SPEC.md
│   └── F3-SLA-DASHBOARD-SPEC.md
│
├── docker-compose.yml         # Configuración de Docker Compose
├── turbo.json                 # Configuración de Turborepo
└── package.json               # Dependencias del monorepo
```

## 🔧 Comandos de Desarrollo

### Comandos Principales

```bash
# Desarrollo
npm run dev              # Iniciar todos los apps en desarrollo
npm run build           # Build de todos los apps para producción
npm run lint            # Lint de todos los packages

# Base de Datos
npm run db:generate     # Generar cliente de Prisma
npm run db:push         # Aplicar cambios del schema
npm run db:seed         # Poblar base de datos con datos de ejemplo

# Apps Individuales
cd apps/frontend && npm run dev        # Solo frontend
cd apps/backend && npm run start:dev   # Solo backend
```

### Comandos de Base de Datos Avanzados

```bash
# Ver el estado de las migraciones
cd apps/backend && npx prisma migrate status

# Crear una nueva migración
cd apps/backend && npx prisma migrate dev --name nombre_migracion

# Resetear la base de datos (¡CUIDADO! Borra todos los datos)
cd apps/backend && npx prisma migrate reset

# Abrir Prisma Studio (GUI para ver/editar datos)
cd apps/backend && npx prisma studio
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Conectar repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub

2. **Configurar Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: apps/frontend
   Build Command: cd ../.. && npm run build --filter=frontend
   Output Directory: .next
   Install Command: npm install
   ```

3. **Variables de Entorno en Vercel**
   ```env
   NEXTAUTH_SECRET=tu-secreto-produccion
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXT_PUBLIC_API_URL=https://tu-backend-api.com
   ```

### Backend (AWS / Railway / Render)

**Opción A: AWS ECS (Contenedores)**

1. Crear un repositorio ECR
2. Push de la imagen Docker
3. Configurar ECS Task Definition
4. Configurar Load Balancer
5. Configurar variables de entorno

**Opción B: Railway**

1. Conectar repositorio de GitHub
2. Configurar:
   ```
   Root Directory: apps/backend
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```
3. Agregar PostgreSQL addon
4. Configurar variables de entorno

**Opción C: Render**

1. Conectar repositorio de GitHub
2. Configurar:
   ```
   Root Directory: apps/backend
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```
3. Agregar PostgreSQL database
4. Configurar variables de entorno

### Base de Datos (Supabase)

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto

2. **Obtener Connection String**
   - Ve a Project Settings > Database
   - Copia la Connection String

3. **Aplicar Schema**
   ```bash
   # Actualizar DATABASE_URL en .env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
   
   # Aplicar schema
   npm run db:push
   
   # Poblar datos iniciales
   npm run db:seed
   ```

## 📊 Schema de Base de Datos

Ver [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) para el ERD completo y documentación del schema.

### Tablas Principales

- **User**: Usuarios del sistema (Requester, Agent, Manager)
- **Ticket**: Tickets de soporte
- **Category**: Categorías de tickets con SLA
- **Comment**: Comentarios en tickets
- **Attachment**: Archivos adjuntos
- **AuditLog**: Registro de auditoría

## 📋 Documentación de la API

La API está documentada usando OpenAPI/Swagger:

- **Desarrollo**: http://localhost:3001/api/docs
- **Producción**: [Tu URL de API]/api/docs

### Endpoints Principales

```
POST   /auth/login              # Login de usuario
POST   /auth/register           # Registro de usuario
GET    /tickets                 # Listar tickets
POST   /tickets                 # Crear ticket
GET    /tickets/:id             # Obtener ticket
PATCH  /tickets/:id             # Actualizar ticket
POST   /tickets/:id/comments    # Agregar comentario
GET    /dashboard/metrics       # Métricas del dashboard
GET    /categories              # Listar categorías
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report

# Frontend tests  
cd apps/frontend
npm run test              # Jest + React Testing Library
npm run test:watch        # Watch mode
```

## 🎨 Sistema de Diseño

Inspirado en **Linear** y **Height** - diseño limpio, funcional y enfocado en desarrolladores:

- Espaciado y tipografía consistentes
- Sombras y bordes sutiles
- Paleta de colores apagados con colores de acento para estados
- Diseño responsive para todos los tamaños de pantalla

### Colores de Estado

- **Open**: Azul
- **In Progress**: Amarillo
- **Resolved**: Verde
- **Closed**: Gris

### Prioridades

- **Low**: Gris
- **Medium**: Azul
- **High**: Naranja
- **Critical**: Rojo

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a la Base de Datos

**Síntoma**: `Error: Can't reach database server`

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
# En macOS/Linux:
pg_isready

# En Docker:
docker ps | grep postgres

# Verificar DATABASE_URL en .env
echo $DATABASE_URL
```

#### 2. Puerto en Uso

**Síntoma**: `Error: Port 3000 is already in use`

**Solución**:
```bash
# Encontrar el proceso usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O usar un puerto diferente
PORT=3002 npm run dev
```

#### 3. Prisma Client No Generado

**Síntoma**: `Cannot find module '@prisma/client'`

**Solución**:
```bash
# Generar el cliente de Prisma
npm run db:generate

# Si persiste, reinstalar dependencias
rm -rf node_modules
npm install
```

#### 4. Variables de Entorno No Cargadas

**Síntoma**: `undefined` en variables de entorno

**Solución**:
```bash
# Verificar que los archivos .env existen
ls -la apps/backend/.env
ls -la apps/frontend/.env.local

# Reiniciar los servidores después de cambiar .env
# Ctrl+C y luego npm run dev
```

#### 5. Error de CORS

**Síntoma**: `Access to fetch blocked by CORS policy`

**Solución**:
- Verificar que `FRONTEND_URL` en backend/.env coincide con la URL del frontend
- Verificar que `NEXT_PUBLIC_API_URL` en frontend/.env.local apunta al backend correcto

#### 6. Docker Compose No Inicia

**Síntoma**: Servicios no inician o fallan

**Solución**:
```bash
# Ver logs detallados
docker-compose logs

# Reconstruir desde cero
docker-compose down -v
docker-compose up --build

# Verificar que los puertos no están en uso
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

### Obtener Ayuda

1. Revisar la carpeta [docs/](docs/) para especificaciones detalladas
2. Revisar logs de error en la terminal
3. Verificar configuración de entorno
4. Verificar conectividad de base de datos
5. Abrir un issue en GitHub con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs de error
   - Versión de Node.js y npm

## 📝 Notas de Desarrollo

### Convenciones de Código

- **TypeScript**: Strict mode habilitado
- **Naming**: camelCase para variables, PascalCase para componentes
- **Imports**: Usar imports absolutos cuando sea posible
- **Comments**: Comentar lógica compleja, no código obvio

### Git Workflow

```bash
# Crear una rama para tu feature
git checkout -b feature/nombre-feature

# Hacer commits descriptivos
git commit -m "feat: agregar filtro de tickets por prioridad"

# Push y crear PR
git push origin feature/nombre-feature
```

### Estructura de Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 🔒 Consideraciones de Seguridad

- Autenticación basada en JWT con almacenamiento seguro de tokens
- Control de acceso basado en roles (RBAC)
- Validación y sanitización de inputs
- Prevención de SQL injection vía Prisma
- Protección XSS con escapado apropiado
- Configuración CORS para seguridad de API
- Variables de entorno para secretos (nunca en código)

## 📈 Optimizaciones de Performance

- Índices de base de datos para queries comunes
- React Query para fetching eficiente de datos
- Optimizaciones de Next.js (SSR, optimización de imágenes)
- Lazy loading para datasets grandes
- Actualizaciones optimistas para mejor UX
- Caching de respuestas de API

## 📄 Licencia

Este proyecto es para propósitos de evaluación/entrevista.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**¿Necesitas ayuda?** Revisa la carpeta `docs/` o abre un issue en GitHub.
