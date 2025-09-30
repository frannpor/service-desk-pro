# ServiceDesk Pro MVP

A modern internal service desk platform for managing support tickets with role-based access, SLA tracking, and comprehensive audit trails.

## 🏗️ Architecture

This is a **Turborepo** monorepo containing:

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: NestJS + Prisma + PostgreSQL
- **Shared**: TypeScript types and utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies**
\`\`\`bash
git clone <repository-url>
cd servicedesk-pro
npm install
\`\`\`

2. **Set up environment variables**
\`\`\`bash
# Copy environment files
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env

# Update DATABASE_URL and other variables in both files
\`\`\`

3. **Set up database**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
\`\`\`

4. **Start development servers**
\`\`\`bash
# Start both frontend and backend
npm run dev

# Or start individually
cd apps/frontend && npm run dev  # http://localhost:3000
cd apps/backend && npm run start:dev  # http://localhost:3001
\`\`\`

## 👥 User Roles & Access

### Test Accounts
- **Manager**: admin@company.com / password123
- **Agent**: agent1@company.com / password123  
- **Requester**: user1@company.com / password123

### Role Permissions
- **Requester**: Create tickets, view own tickets, add comments
- **Agent**: Manage assigned tickets, view all tickets, internal comments
- **Manager**: Full access, configure categories, view analytics

## 🎯 Core Features

### ✅ F1 - Ticket Intake & Categories
- Dynamic ticket creation forms based on categories
- Custom fields configuration by managers
- Automatic SLA assignment based on category

### ✅ F2 - Ticket Lifecycle & Audit
- Complete ticket state management
- Role-based permissions
- Comprehensive audit trail
- Concurrency handling

### ✅ F3 - SLA Monitoring & Dashboard
- Real-time SLA tracking and alerts
- Executive dashboard with key metrics
- Performance analytics by agent/category

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form + Zod validation
- **State**: React Query for server state
- **Auth**: NextAuth.js v5

### Backend  
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT with Passport.js
- **Validation**: Class Validator + Class Transformer

## 📁 Project Structure

\`\`\`
servicedesk-pro/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # TypeScript type definitions
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── modules/   # Feature modules
│       │   ├── common/    # Shared utilities
│       │   └── types/     # TypeScript types
│       └── prisma/        # Database schema and migrations
├── docs/                  # Technical specifications
└── packages/              # Shared packages (if needed)
\`\`\`

## 🔧 Development Commands

\`\`\`bash
# Development
npm run dev              # Start all apps in development
npm run build           # Build all apps for production
npm run lint            # Lint all packages

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:seed         # Seed database with sample data

# Individual apps
cd apps/frontend && npm run dev
cd apps/backend && npm run start:dev
\`\`\`

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `cd ../.. && npm run build --filter=frontend`
3. Set environment variables in Vercel dashboard

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set build command: `cd apps/backend && npm run build`
3. Set start command: `cd apps/backend && npm run start:prod`
4. Configure environment variables

## 📊 Database Schema

See [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) for complete ERD and schema documentation.

## 📋 API Documentation

API endpoints are documented using OpenAPI/Swagger:
- Development: http://localhost:3001/api/docs
- Production: [Your API URL]/api/docs

## 🧪 Testing

\`\`\`bash
# Backend tests
cd apps/backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report

# Frontend tests  
cd apps/frontend
npm run test              # Jest + React Testing Library
\`\`\`

## 🎨 UI Design System

Inspired by **Linear** and **Height** - clean, functional, developer-focused design:
- Consistent spacing and typography
- Subtle shadows and borders
- Muted color palette with accent colors for status
- Responsive design for all screen sizes

See [docs/UI-STYLE.md](docs/UI-STYLE.md) for complete design documentation.

## 🤖 AI Usage

This project leverages AI tools for development acceleration:
- Code generation and boilerplate creation
- Test case generation
- Documentation writing
- Schema design validation

See [docs/AI-USAGE.md](docs/AI-USAGE.md) for detailed AI usage documentation.

## 🔒 Security Considerations

- JWT-based authentication with secure token storage
- Role-based access control (RBAC) 
- Input validation and sanitization
- SQL injection prevention via Prisma
- XSS protection with proper escaping
- CORS configuration for API security

## 📈 Performance Optimizations

- Database indexes for common queries
- React Query for efficient data fetching
- Next.js optimizations (SSR, image optimization)
- Lazy loading for large datasets
- Optimistic updates for better UX

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify PostgreSQL is running and DATABASE_URL is correct
2. **Port Conflicts**: Frontend (3000) and Backend (3001) ports must be available
3. **Environment Variables**: Ensure all required variables are set in .env files
4. **Prisma Issues**: Run `npm run db:generate` after schema changes

### Getting Help

1. Check the [docs/](docs/) folder for detailed specifications
2. Review error logs in terminal
3. Verify environment configuration
4. Check database connectivity

## 📄 License

This project is for interview/evaluation purposes.
