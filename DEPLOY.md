# SOFIA — Guia de Despliegue en VPS (Hostinger)

## Arquitectura de produccion

```
Internet (puerto 80)
    |
  nginx ─────┬──── /api/*        ──→  sofia-backend  :4000
              ├──── /socket.io/*  ──→  sofia-backend  :4000 (WebSocket)
              ├──── /webhook/*    ──→  sofia-n8n      :5678
              └──── /*            ──→  sofia-frontend  :3000

Puerto 3100 ─────→ sofia-control-center (admin)
Puerto 5678 ─────→ sofia-n8n UI (workflows)
```

Servicios internos (no expuestos):
- `sofia-postgres` — PostgreSQL 16 + pgvector
- `sofia-redis` — Redis 7

---

## Requisitos previos

- VPS con Docker y Docker Compose instalados
- Acceso SSH al servidor
- API keys: OpenAI, Anthropic (minimo)

---

## Paso 1: Clonar el repositorio en el VPS

```bash
ssh root@srv910634.hstgr.cloud
cd /opt
git clone https://github.com/figueroajoseopsu95-ship-it/sofia-interno.git sofia
cd sofia
```

---

## Paso 2: Configurar variables de entorno

```bash
cp .env.production.example .env
nano .env
```

Completar TODAS las variables. Generar passwords seguros:
```bash
# Generar passwords aleatorios
openssl rand -base64 32   # para POSTGRES_PASSWORD
openssl rand -base64 32   # para REDIS_PASSWORD
openssl rand -base64 48   # para JWT_SECRET
openssl rand -base64 32   # para INTERNAL_API_KEY
openssl rand -base64 24   # para N8N_AUTH_PASSWORD
```

---

## Paso 3: Permisos del script de inicializacion

```bash
chmod +x sofia-backend/prisma/create-n8n-db.sh
```

---

## Paso 4: Construir y levantar

```bash
docker compose up -d --build
```

La primera vez tardara varios minutos (descarga imagenes + build de 3 apps Node.js).

Monitorear el progreso:
```bash
docker compose logs -f
```

---

## Paso 5: Verificar servicios

```bash
docker compose ps
```

Todos los servicios deben estar en estado `Up` o `healthy`.

Verificar endpoints:
```bash
# Backend API
curl http://localhost/api/v1

# Frontend
curl -I http://localhost/

# n8n
curl -I http://localhost:5678

# Control Center
curl -I http://localhost:3100
```

---

## Paso 6: Seed de usuarios (opcional)

Para crear los usuarios de prueba, ejecutar dentro del contenedor del backend:

```bash
docker compose exec sofia-backend npx prisma db seed
```

Usuarios creados:
| Codigo  | Password   | Rol        |
|---------|------------|------------|
| EMP001  | Sofia2026! | employee   |
| SUP001  | Sofia2026! | supervisor |
| ADM001  | Sofia2026! | admin      |
| SAD001  | Sofia2026! | superadmin |

> Cambiar estos passwords antes de produccion real.

---

## Paso 7: Configurar n8n workflows

1. Acceder a n8n: `http://srv910634.hstgr.cloud:5678`
2. Login con las credenciales de N8N_AUTH_USER / N8N_AUTH_PASSWORD
3. Importar los 10 workflows en orden (ver IMPORT-ORDER.md en sofia-backend/n8n-workflows/)
4. Crear credencial Anthropic en n8n y reconectarla en cada workflow con LLM
5. Activar workflows: especialistas primero, router al final

---

## Acceso a los servicios

| Servicio         | URL                                          |
|------------------|----------------------------------------------|
| Frontend         | http://srv910634.hstgr.cloud                 |
| API / Swagger    | http://srv910634.hstgr.cloud/api/docs        |
| Control Center   | http://srv910634.hstgr.cloud:3100            |
| n8n              | http://srv910634.hstgr.cloud:5678            |

---

## Despliegue via Hostinger Docker Manager

Si prefieres usar el Docker Manager de Hostinger en lugar de SSH:

1. En el panel de Hostinger, ir a Docker Manager
2. Pegar la URL del repositorio
3. Asegurarse de que detecte el `docker-compose.yml` de la raiz
4. El Docker Manager necesita que las variables de entorno esten en un `.env` en la raiz del repo, o configurarlas en el panel

> **Nota**: El Docker Manager de Hostinger puede tener limitaciones con `build:` (Dockerfiles custom). Si falla, usar el metodo SSH.

---

## Comandos utiles

```bash
# Ver logs de un servicio especifico
docker compose logs -f sofia-backend

# Reiniciar un servicio
docker compose restart sofia-backend

# Reconstruir un servicio despues de cambios
docker compose up -d --build sofia-backend

# Entrar al contenedor del backend
docker compose exec sofia-backend sh

# Ver estado de la base de datos
docker compose exec sofia-postgres psql -U sofia_user -d sofia_db -c "\dt"

# Limpiar todo y empezar de cero
docker compose down -v    # CUIDADO: borra volumenes/datos
docker compose up -d --build
```

---

## Troubleshooting

### PostgreSQL no inicia
```bash
docker compose logs sofia-postgres
```
Causas comunes:
- Password con caracteres especiales no escapados en .env
- Volumen corrupto: `docker compose down -v` y reiniciar

### Frontend/Control Center no carga
```bash
docker compose logs sofia-frontend
docker compose logs sofia-control-center
```
Causa comun: fallo en `npm run build` por falta de memoria.
Solucion: construir uno a la vez:
```bash
docker compose build sofia-frontend
docker compose build sofia-control-center
docker compose up -d
```

### n8n no conecta a postgres
Verificar que `sofia_n8n_db` fue creada:
```bash
docker compose exec sofia-postgres psql -U sofia_user -d postgres -c "\l"
```

### Webhooks de n8n no funcionan externamente
Verificar que `PUBLIC_URL` en `.env` tiene la URL correcta del servidor
y que el puerto 80 esta abierto en el firewall.
