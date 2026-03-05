# SOFIA — Guía de Activación para Pruebas

## Resumen del Estado Actual

| Componente | Estado | Acción requerida |
|---|---|---|
| Backend NestJS | ✅ Implementado | Añadir API keys al .env |
| PostgreSQL + pgvector | ✅ En Docker | Levantar + migrar |
| Redis | ✅ En Docker | Levantar |
| n8n | ✅ En Docker | Levantar + configurar + importar workflow |
| Workflow AI Agent | ❌ Faltaba | Importar `sofia-main-agent.json` |
| Frontend (empleados) | ✅ Implementado | `npm run dev` |
| Control Center (admin) | ✅ Implementado | `npm run dev` |

---

## PRE-REQUISITO: API Keys

Necesitas mínimo estas dos claves:

1. **OpenAI API Key** → Para embeddings (RAG funcional). Sin esta, la búsqueda semántica falla.
   - https://platform.openai.com/api-keys

2. **Anthropic API Key** → Para el agente SOFIA en n8n (Claude Haiku) y reranking.
   - https://console.anthropic.com/settings/keys

Una vez obtenidas, edita `sofia-backend/.env.development`:
```
OPENAI_API_KEY=sk-tu-key-real-aqui
ANTHROPIC_API_KEY=sk-ant-tu-key-real-aqui
```

---

## PASO 1 — Levantar servicios Docker

```bash
cd "C:\Users\figue\Documents\SOFIA INTERNO\SOFIA\sofia-backend"

# Levantar todos los servicios (PostgreSQL, Redis, n8n)
docker-compose up -d

# Verificar que están healthy (esperar ~30s)
docker-compose ps
```

Resultado esperado:
```
sofia-postgres    healthy
sofia-redis       healthy
sofia-n8n         running   → http://localhost:5678
```

---

## PASO 2 — Migrar base de datos

```bash
cd "C:\Users\figue\Documents\SOFIA INTERNO\SOFIA\sofia-backend"

# Instalar dependencias si no están
npm install

# Ejecutar migraciones (crea todos los schemas y tablas)
npx prisma migrate dev --schema=prisma/schema.prisma

# Cargar datos seed (usuarios de prueba)
npx prisma db seed
```

Usuarios creados:
| Code | Password | Rol |
|------|----------|-----|
| EMP001 | Sofia2026! | employee |
| SUP001 | Sofia2026! | supervisor |
| ADM001 | Sofia2026! | admin |
| SAD001 | Sofia2026! | superadmin |

---

## PASO 3 — Configurar n8n

### 3.1 Abrir n8n
Ir a http://localhost:5678
- Usuario: `admin`
- Contraseña: `sofia_n8n_dev_2026`

### 3.2 Crear credencial Anthropic
1. Menú lateral → **Settings** → **Credentials**
2. Clic en **+ Add Credential**
3. Buscar y seleccionar **"Anthropic"**
4. Nombre: `Anthropic - SOFIA`
5. API Key: pegar tu clave `sk-ant-...`
6. **Save**

### 3.3 Importar el workflow SOFIA
1. Menú lateral → **Workflows**
2. Clic en **+ Add Workflow** → **Import from file**
3. Seleccionar: `sofia-backend/n8n-workflows/sofia-main-agent.json`
4. El workflow se importa con 6 nodos

### 3.4 Configurar la credencial en el nodo LLM
1. Abrir el workflow importado
2. Hacer clic en el nodo **"Modelo Claude Haiku"** (color morado)
3. En el campo **Credential**, seleccionar `Anthropic - SOFIA`
4. **Save** el nodo

### 3.5 Activar el workflow
1. En la esquina superior derecha, activar el toggle **"Inactive" → "Active"**
2. Verificar que aparezca el webhook URL en el nodo "Entrada Webhook"
   - URL de producción: `http://localhost:5678/webhook/sofia-router`

---

## PASO 4 — Iniciar el backend

```bash
cd "C:\Users\figue\Documents\SOFIA INTERNO\SOFIA\sofia-backend"

# Modo desarrollo (hot-reload)
npm run start:dev
```

Verificar en logs:
```
[NestApplication] Nest application successfully started
Application running on port 4000
Swagger docs: http://localhost:4000/api/docs
```

**Probar que el backend funciona:**
```bash
curl http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeCode":"EMP001","password":"Sofia2026!"}'
```

---

## PASO 5 — Iniciar frontends

### Frontend empleados (puerto 3000):
```bash
cd "C:\Users\figue\Documents\SOFIA INTERNO\SOFIA\sofia-frontend"
npm install
npm run dev
```

Crear `.env.local` si no existe:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### Control Center admin (puerto 3100):
```bash
cd "C:\Users\figue\Documents\SOFIA INTERNO\SOFIA\sofia-control-center"
npm install
npm run dev
```

Crear `.env.local` si no existe:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## PASO 6 — Prueba end-to-end

1. Abrir http://localhost:3000
2. Login: `EMP001` / `Sofia2026!`
3. Crear nueva conversación
4. Enviar un mensaje: `"¿Cuáles son los productos de ahorro de Banesco?"`
5. SOFIA debe responder (aunque sin datos en la base de conocimientos dirá que no encontró información)

### Flujo técnico de un mensaje:
```
Frontend (WS) → Backend ChatService → n8n Webhook →
AI Agent (Claude) → RAG Search (Backendernal API) →
Respuesta → Backend ChatService → Frontend (WS)
```

---

## Verificaciones de salud

### Verificar integración n8n ↔ backend:
```bash
curl -X POST http://localhost:5678/webhook/sofia-router \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: sofia-internal-dev-key-2026-change-in-prod" \
  -d '{
    "conversationId": "test-123",
    "userId": "test-user",
    "message": "Hola, ¿cómo estás?",
    "channel": "web",
    "history": []
  }'
```

Respuesta esperada:
```json
{
  "response": "¡Hola! Soy SOFIA...",
  "agentName": "SofiaMainAgent",
  "sourcesCited": null,
  "tokenCount": 45,
  "modelUsed": "claude-haiku-4-5-20251001"
}
```

### Verificar RAG (requiere OPENAI_API_KEY):
```bash
curl -X POST http://localhost:4000/api/v1/internal/v1/rag/search \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: sofia-internal-dev-key-2026-change-in-prod" \
  -d '{"query": "productos de ahorro", "topK": 3}'
```

---

## Troubleshooting

### Error: "n8n no responde / timeout"
- Verificar que n8n esté activo: `docker-compose ps`
- Verificar que el workflow esté en estado **Active** en n8n
- Verificar que N8N_WEBHOOK_URL en .env sea correcto

### Error: "Embedding failed / OpenAI error"
- Verificar que OPENAI_API_KEY esté configurado correctamente en `.env.development`
- Reiniciar el backend después de editar el .env

### Error: "Invalid Internal API Key"
- Verificar que INTERNAL_API_KEY en `.env.development` coincida con el de `docker-compose.yml`
- Ambos deben ser: `sofia-internal-dev-key-2026-change-in-prod`

### Error: "host.docker.internal not resolved" (Linux)
- En docker-compose.yml ya está configurado `extra_hosts: host.docker.internal:host-gateway`
- Si persiste, reemplazar en el workflow de n8n la URL con la IP del host

### n8n no puede conectarse a PostgreSQL
- Verificar que `sofia-postgres` esté healthy antes de que n8n intente conectar
- Ejecutar: `docker-compose restart sofia-n8n`

---

## Arquitectura de la integración

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOCKER NETWORK                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Postgres   │    │    Redis     │    │      n8n         │  │
│  │   :5432      │    │    :6379     │    │     :5678        │  │
│  └──────────────┘    └──────────────┘    └─────────┬────────┘  │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │ HTTP
                                    ┌──────────────────▼────────────────┐
                                    │     NestJS Backend :4000           │
                                    │  /api/v1/internal/v1/rag/search    │
                                    │  /api/v1/internal/v1/users/:id     │
                                    └──────────────────┬────────────────┘
                                                       │ WebSocket / REST
                                    ┌──────────────────▼────────────────┐
                                    │   Next.js Frontend :3000           │
                                    │   Next.js Control Center :3100     │
                                    └───────────────────────────────────┘
```
