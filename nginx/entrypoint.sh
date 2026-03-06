#!/bin/sh
set -e

SSL_DIR="/etc/nginx/ssl"
LE_DIR="/etc/letsencrypt/live"
CONF_DIR="/etc/nginx/conf.d"

mkdir -p "$SSL_DIR"

# Check for Let's Encrypt certificates (any domain)
LE_CERT=""
if [ -d "$LE_DIR" ]; then
    for dir in "$LE_DIR"/*/; do
        if [ -f "${dir}fullchain.pem" ] && [ -f "${dir}privkey.pem" ]; then
            LE_CERT="$dir"
            break
        fi
    done
fi

if [ -n "$LE_CERT" ]; then
    echo "=== Using Let's Encrypt certificates from $LE_CERT ==="
    ln -sf "${LE_CERT}fullchain.pem" "$SSL_DIR/cert.pem"
    ln -sf "${LE_CERT}privkey.pem" "$SSL_DIR/key.pem"
elif [ -f "$SSL_DIR/cert.pem" ] && [ -f "$SSL_DIR/key.pem" ]; then
    echo "=== Using existing SSL certificates ==="
else
    echo "=== Generating self-signed SSL certificate ==="
    DOMAIN="${NGINX_HOST:-localhost}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
fi

# If SSL certs are available, use the HTTPS config
if [ -f "$SSL_DIR/cert.pem" ]; then
    echo "=== Enabling HTTPS configuration ==="
    NGINX_HOST="${NGINX_HOST:-_}"
    export NGINX_HOST
    envsubst '${NGINX_HOST}' < /etc/nginx/ssl.conf.template > "$CONF_DIR/default.conf"
    echo "=== HTTPS enabled for $NGINX_HOST ==="
else
    echo "=== Running HTTP only ==="
fi

echo "=== Starting nginx ==="
exec nginx -g "daemon off;"
