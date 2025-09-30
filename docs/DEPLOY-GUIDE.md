📦 SERVICEDESK-PRO — Guía de despliegue
Este instructivo explica cómo levantar correctamente el monorepo servicedesk-pro (backend + frontend + base de datos).

🔖 Resumen rápido
Levantar la infraestructura con Docker Compose.

Instalar dependencias (npm i).

Generar Prisma (npm run db:generate).

Empujar esquema (npm run db:push).

Ejecutar los servidores (npm run dev) o acceder a los containers en producción vía Docker.

📁 Estructura relevante
text
/
├─ apps/
│ ├─ backend/
│ └─ frontend/
├─ docs/
├─ package.json
├─ docker-compose.yml
└─ turbo.json
🐳 Docker Compose
Se utiliza Postgres, backend, frontend y opcionalmente PgAdmin.
⚠️ Importante: dentro de la red Docker los servicios se comunican por el puerto interno 5432.

yaml
version: "3.8"

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
      DATABASE_URL: postgresql://servicedesk_user:password@postgres:5432/servicedesk_pro_db
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
🛠️ Pasos para levantar el proyecto
1. Levantar servicios
bash
docker compose up --build -d
Esto inicia Postgres, backend y frontend.

2. Instalar dependencias
bash
# desde la raíz
npm i
3. Generar Prisma
bash
npm run db:generate
4. Empujar esquema a la DB
bash
npm run db:push
5. Ejecutar en dev
bash
npm run dev
Esto levanta backend (3001) y frontend (3000).