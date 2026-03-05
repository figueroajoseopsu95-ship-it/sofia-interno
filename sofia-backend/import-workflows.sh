#!/bin/bash
# =============================================================================
# SOFIA — Script de importación automática de workflows en n8n
# Uso: bash import-workflows.sh
# Requiere: docker-compose up -d (n8n corriendo)
# =============================================================================

# Detectar el nombre real del contenedor (puede ser sofia-n8n o sofia-backend-sofia-n8n-1)
CONTAINER=$(docker ps --filter "name=sofia-n8n" --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER" ]; then
  CONTAINER="sofia-n8n"
fi
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SOFIA — Importación de Workflows n8n           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que el contenedor n8n esté corriendo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo -e "${RED}✗ El contenedor '${CONTAINER}' no está corriendo.${NC}"
  echo -e "  Ejecuta primero: ${YELLOW}docker-compose up -d${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Contenedor n8n detectado y corriendo${NC}"
echo ""

# Copiar los workflows al contenedor (necesario en Windows donde el volume mount puede fallar)
echo -e "📁 Copiando workflows al contenedor..."
docker cp ./n8n-workflows "$CONTAINER":/home/node/workflows >/dev/null 2>&1 && \
  echo -e "${GREEN}✓ Archivos copiados al contenedor${NC}" || \
  echo -e "${YELLOW}⚠ Aviso: falló la copia, asumiendo que ya están montados${NC}"
echo ""

# Esperar a que n8n esté listo (puede tardar unos segundos en arrancar)
echo -e "⏳ Esperando que n8n esté listo..."
for i in {1..15}; do
  if docker exec "$CONTAINER" wget -q -O- http://localhost:5678/healthz >/dev/null 2>&1; then
    echo -e "${GREEN}✓ n8n está listo${NC}"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo -e "${YELLOW}⚠ n8n tardó en responder, intentando importar de todas formas...${NC}"
  fi
  sleep 2
done

echo ""

# Orden de importación: especialistas primero, router al final
declare -a WORKFLOWS=(
  "wf-00-rag-engine.json:SOFIA RAG Engine (sub-workflow)"
  "wf-02-psd-agent.json:Agente PSD - Productos Digitales"
  "wf-03-pasivos-agent.json:Agente Pasivos - Cuentas y Depósitos"
  "wf-04-atc-agent.json:Agente ATC - Atención al Cliente"
  "wf-05-finanzas-agent.json:Agente Finanzas"
  "wf-06-comercial-agent.json:Agente Comercial - Banca Empresarial"
  "wf-07-legal-agent.json:Agente Legal & Compliance"
  "wf-08-escalation-agent.json:Agente Escalamiento"
  "wf-09-feedback-analyzer.json:Feedback Analyzer"
  "wf-01-router.json:Router Agent (entrada principal)"
)

SUCCESS=0
FAILED=0

for entry in "${WORKFLOWS[@]}"; do
  file="${entry%%:*}"
  name="${entry##*:}"

  echo -e "  → Importando: ${CYAN}${name}${NC}"

  result=$(MSYS_NO_PATHCONV=1 docker exec "$CONTAINER" n8n import:workflow --input="/home/node/workflows/${file}" 2>&1)

  if echo "$result" | grep -qi "error\|failed\|cannot"; then
    echo -e "    ${RED}✗ Error: ${result}${NC}"
    ((FAILED++))
  else
    echo -e "    ${GREEN}✓ Importado correctamente${NC}"
    ((SUCCESS++))
  fi
done

echo ""
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "  Resultado: ${GREEN}${SUCCESS} importados${NC}  ${RED}${FAILED} con error${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo ""

if [ "$SUCCESS" -gt 0 ]; then
  echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
  echo ""
  echo -e "1. Abre ${CYAN}http://localhost:5678${NC}"
  echo -e "   Usuario: admin | Contraseña: sofia_n8n_dev_2026"
  echo ""
  echo -e "2. En cada workflow que usa LLM (wf-01 al wf-07):"
  echo -e "   → Haz clic en el nodo ${CYAN}'Modelo Claude Haiku'${NC} o ${CYAN}'Modelo Claude Sonnet'${NC}"
  echo -e "   → En 'Credential', selecciona tu credencial Anthropic"
  echo -e "   → Guarda el nodo"
  echo ""
  echo -e "3. Activa los workflows en este orden:"
  echo -e "   ${CYAN}wf-00 → wf-02 al wf-09 → wf-01 (router al final)${NC}"
  echo ""
  echo -e "4. Prueba enviando un mensaje desde el frontend: ${CYAN}http://localhost:3000${NC}"
fi
