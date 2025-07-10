#!/bin/sh
set -e

echo "Waiting for DB (db:3306)…"
while ! nc -z db 3306; do
  sleep 1
done

echo "Waiting for CA cert (/usr/app/certs/ca.crt)…"
while [ ! -f /usr/app/certs/ca.crt ]; do
  sleep 1
done

echo "All dependencies ready, starting app…"
exec "$@"
