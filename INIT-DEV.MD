# 🚀 Guía de Despliegue - ServiceDesk Pro

## 🛠️ Estructura del Proyecto

```
servicedesk-pro/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env
│   └── frontend/
│       ├── app/
│       ├── components/
│       ├── Dockerfile
│       ├── package.json
│       └── .env.local
├── docker-compose.yml
├── .dockerignore
├── .env.example
└── package.json
```

## 📦 Configuración de Variables de Entorno

### Backend (`apps/backend/.env`)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://servicedesk_user:password@localhost:5433/servicedesk_pro_db
JWT_SECRET=xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`apps/frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xPfFSOIysG3ZiDFUNTZd_MtNicatEV5P-JTXkSjOyJ4
```

## 🚀 Comandos de Despliegue

### Desarrollo Local (sin Docker)

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Levantar solo la base de datos con Docker
docker-compose up postgres -d

# 3. Generar Prisma Client
npm run db:generate

# 4. Aplicar migraciones
npm run db:push

# 5. Ejecutar seeds
npm run db:seed

# 6. Iniciar aplicaciones en desarrollo
npm run dev
```

### Producción con Docker

```bash
# 1. Construir y levantar todos los servicios
docker-compose up --build -d

# 2. Ver logs
docker-compose logs -f

# 3. Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend

# 4. Verificar estado
docker-compose ps

# 5. Reiniciar servicios
docker-compose restart backend
docker-compose restart frontend

# 6. Detener servicios
docker-compose down

# 7. Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v
```

## 🔍 Verificación de Despliegue

### 1. Verificar Base de Datos
```bash
docker exec -it servicedesk-postgres psql -U servicedesk_user -d servicedesk_pro_db -c "\dt"
```

### 2. Verificar Frontend
```bash
# Visita: http://localhost:3000
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"
```bash
# Verificar que Postgres esté saludable
docker-compose ps postgres

# Ver logs de Postgres
docker-compose logs postgres

# Reiniciar Postgres
docker-compose restart postgres
```

### Error: "Module not found" en Backend
```bash
# Reconstruir backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Error: "Invalid environment variables" en Frontend
```bash
# Verificar que las variables NEXT_PUBLIC_ estén en build args
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Limpiar y Reiniciar Completamente
```bash
# Detener todo
docker-compose down

# Eliminar imágenes
docker-compose down --rmi all

# Eliminar volúmenes
docker-compose down -v

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Seguridad para Producción

Antes de desplegar en producción, cambia:

1. **JWT_SECRET y NEXTAUTH_SECRET**: Genera nuevos valores únicos
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

2. **Contraseñas de Base de Datos**: Usa contraseñas fuertes

3. **CORS_ORIGIN**: Configura el dominio real de producción

4. **Variables de Entorno**: Usa archivos `.env` separados o secretos de Docker/Kubernetes

## 📊 Monitoreo

### Ver uso de recursos
```bash
docker stats
```

### Ver logs en tiempo real
```bash
docker-compose logs -f --tail=100
```

### Backup de Base de Datos
```bash
docker exec servicedesk-postgres pg_dump -U servicedesk_user servicedesk_pro_db > backup.sql
```

### Restaurar Base de Datos
```bash
docker exec -i servicedesk-postgres psql -U servicedesk_user servicedesk_pro_db < backup.sql
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs con `docker-compose logs -f`
2. Verifica la conectividad de red con `docker network inspect servicedesk-network`
3. Asegúrate de que los puertos no estén ocupados: `lsof -i :3000,3001,5433`