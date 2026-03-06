#!/bin/bash
set -e

echo "=== Creating sofia_n8n_db database if it doesn't exist ==="

# Check if sofia_n8n_db exists; create it if not
psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname postgres \
  -tc "SELECT 1 FROM pg_database WHERE datname = 'sofia_n8n_db'" | grep -q 1 \
  || psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
       -c "CREATE DATABASE sofia_n8n_db OWNER $POSTGRES_USER;"

echo "=== sofia_n8n_db ready ==="
