FROM nginx:alpine

RUN apk add --no-cache openssl

COPY default.conf /etc/nginx/conf.d/default.conf
COPY ssl.conf.template /etc/nginx/ssl.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
