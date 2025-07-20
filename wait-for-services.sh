#!/bin/bash

set -e

echo "[INFO] Waiting for database on db:3306..."
while ! nc -z db 3306 >/dev/null 2>&1; do
  echo "[INFO] DB not ready yet. Retrying in 1s..."
  sleep 1
done
echo "[INFO] DB is ready ✅"

echo "[INFO] Waiting for CA certificate at /usr/app/certs/ca.crt..."
while [ ! -f /usr/app/certs/ca.crt ]; do
  echo "[INFO] CA cert not found. Retrying in 1s..."
  sleep 1
done
echo "[INFO] CA certificate is ready ✅"

echo "[INFO] All dependencies ready. Starting application..."
exec "$@"
