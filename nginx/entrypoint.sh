#!/bin/sh
set -e

SSL_DIR="/etc/nginx/ssl"
LE_DIR="/etc/letsencrypt/live"
CONF_DIR="/etc/nginx/conf.d"

mkdir -p "$SSL_DIR"

# Check for REAL Let's Encrypt certificates (any domain)
LE_FOUND=false
if [ -d "$LE_DIR" ]; then
    for dir in "$LE_DIR"/*/; do
        if [ -f "${dir}fullchain.pem" ] && [ -f "${dir}privkey.pem" ]; then
            echo "=== Found Let's Encrypt certificates in $dir ==="
            ln -sf "${dir}fullchain.pem" "$SSL_DIR/cert.pem"
            ln -sf "${dir}privkey.pem" "$SSL_DIR/key.pem"
            LE_FOUND=true
            break
        fi
    done
fi

if [ "$LE_FOUND" = true ]; then
    # Real Let's Encrypt certs: enable HTTPS with HTTP->HTTPS redirect
    NGINX_HOST="${NGINX_HOST:-_}"
    export NGINX_HOST
    envsubst '${NGINX_HOST}' < /etc/nginx/ssl.conf.template > "$CONF_DIR/default.conf"
    echo "=== HTTPS enabled with redirect for $NGINX_HOST ==="
else
    # No real certs: keep HTTP-only config (default.conf stays as-is)
    echo "=== Running HTTP only (no SSL redirect) ==="
    echo "=== Run certbot to enable HTTPS ==="
fi

echo "=== Starting nginx ==="
exec nginx -g "daemon off;"
