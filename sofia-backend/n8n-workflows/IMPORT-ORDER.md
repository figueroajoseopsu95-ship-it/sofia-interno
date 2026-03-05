# SOFIA n8n Workflows — Guía de Importación y Activación

## Orden de importación (CRÍTICO)

Importa los workflows en este orden exacto en n8n (http://localhost:5678):

```
Paso 1: wf-00-rag-engine.json          ← Sub-workflow compartido
Paso 2: wf-02-psd-agent.json           ← Especialista PSD
Paso 3: wf-03-pasivos-agent.json       ← Especialista Pasivos
Paso 4: wf-04-atc-agent.json           ← Especialista ATC
Paso 5: wf-05-finanzas-agent.json      ← Especialista Finanzas
Paso 6: wf-06-comercial-agent.json     ← Especialista Comercial
Paso 7: wf-07-legal-agent.json         ← Especialista Legal
Paso 8: wf-08-escalation-agent.json    ← Agente Escalamiento
Paso 9: wf-09-feedback-analyzer.json   ← Analizador Feedback
Paso 10: wf-01-router.json             ← Router (ÚLTIMO, depende de todos)
```

> ⚠️ El Router DEBE importarse último porque llama a los especialistas.

---

## Cómo importar cada workflow

1. Ir a http://localhost:5678
2. Login: admin / sofia_n8n_dev_2026
3. Menú lateral → **Workflows** → botón **+** → **Import from file**
4. Seleccionar el archivo .json
5. Clic en **Import**

---

## Reconectar credenciales (después de importar)

Cada workflow que usa Claude necesita que le asignes la credencial Anthropic.
n8n mostrará un badge rojo ⚠️ en el nodo "Modelo Claude Sonnet" o "Modelo Claude Haiku".

Para cada workflow con LLM:
1. Abrir el workflow
2. Hacer clic en el nodo con badge rojo (Modelo Claude Haiku o Modelo Claude Sonnet)
3. En el campo **Credential**, seleccionar la credencial Anthropic que creaste (ej: `Anthropic - SOFIA`)
4. Guardar el nodo
5. Guardar el workflow

Workflows que necesitan credencial Anthropic:
- wf-01-router (Claude Haiku - para clasificación)
- wf-02-psd-agent (Claude Sonnet)
- wf-03-pasivos-agent (Claude Sonnet)
- wf-04-atc-agent (Claude Sonnet)
- wf-05-finanzas-agent (Claude Sonnet)
- wf-06-comercial-agent (Claude Sonnet)
- wf-07-legal-agent (Claude Sonnet)

Workflows SIN LLM (no necesitan credencial):
- wf-00-rag-engine (solo HTTP al backend)
- wf-08-escalation-agent (respuesta estándar sin LLM)
- wf-09-feedback-analyzer (solo registra eventos)

---

## Orden de activación

Activar los workflows en este orden (toggle Inactive → Active):

```
1. wf-00-rag-engine         (activar primero)
2. wf-02 al wf-09           (cualquier orden)
3. wf-01-router             (activar ÚLTIMO)
```

---

## Verificar que todo funciona

### Test rápido del Router:
```bash
curl -X POST http://localhost:5678/webhook/sofia-router \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: sofia-internal-dev-key-2026-change-in-prod" \
  -d '{
    "conversationId": "test-conv-001",
    "userId": "test-user-001",
    "message": "Hola, buenos días",
    "channel": "web",
    "history": []
  }'
```

Respuesta esperada:
```json
{
  "response": "¡Hola! Soy SOFIA...",
  "agentName": "RouterAgent",
  "sourcesCited": null,
  "tokenCount": 45,
  "modelUsed": "claude-haiku-4-5-20251001"
}
```

### Test de agente especialista PSD:
```bash
curl -X POST http://localhost:5678/webhook/sofia-psd \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-002",
    "userId": "test-user-001",
    "message": "¿Cómo activo la tarjeta de débito virtual?",
    "channel": "web",
    "history": []
  }'
```

### URLs de cada agente (para referencia):
| Agente | Webhook URL |
|--------|-------------|
| Router (entrada principal) | http://localhost:5678/webhook/sofia-router |
| PSD | http://localhost:5678/webhook/sofia-psd |
| Pasivos | http://localhost:5678/webhook/sofia-pasivos |
| ATC | http://localhost:5678/webhook/sofia-atc |
| Finanzas | http://localhost:5678/webhook/sofia-finanzas |
| Comercial | http://localhost:5678/webhook/sofia-comercial |
| Legal | http://localhost:5678/webhook/sofia-legal |
| Escalamiento | http://localhost:5678/webhook/sofia-escalation |
| Feedback | http://localhost:5678/webhook/sofia-feedback |

---

## Troubleshooting

**"Workflow not found" al importar:**
- Verifica que n8n esté corriendo: `docker-compose ps`
- Reinicia si hace falta: `docker-compose restart sofia-n8n`

**Credencial no encontrada:**
- Settings → Credentials → + Add Credential → Anthropic
- Nombre exacto: `Anthropic - SOFIA`
- Pegar la API key de Anthropic

**Specialist no responde (timeout desde Router):**
- Verificar que el specialist esté activado en n8n
- Verificar que el workflow del specialist no tenga errores (ver Executions)
- Probar el specialist directamente con curl

**$env.INTERNAL_API_KEY vacío:**
- Verificar que en docker-compose.yml, el servicio sofia-n8n tenga `INTERNAL_API_KEY` configurado
- Reiniciar n8n: `docker-compose restart sofia-n8n`
- En n8n, ir a Settings → Variables para verificar que la variable esté disponible

**Backend no accesible desde n8n:**
- Verificar que el backend NestJS esté corriendo en puerto 4000
- En Windows/Mac: `host.docker.internal` debería funcionar automáticamente
- En Linux: verificar que `extra_hosts: host.docker.internal:host-gateway` esté en docker-compose.yml
