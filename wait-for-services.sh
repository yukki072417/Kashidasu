# #!/bin/bash

set -e

# MySQLが起動するまで待機
echo "[INFO] Waiting for MySQL to be ready on db:3306..."
until mysqladmin ping -h "db" --silent; do
  echo "[INFO] DB not ready yet. Retrying in 1s..."
  sleep 1
done
echo "[INFO] DB is ready"

# CA証明書の準備を確認
echo "[INFO] Waiting for CA certificate at /usr/app/certs/ca.crt..."
while [ ! -f /usr/app/certs/ca.crt ]; do
  echo "[INFO] CA cert not found. Retrying in 1s..."
  sleep 1
done
echo "[INFO] CA certificate is ready"

echo "[INFO] All dependencies ready. Starting application..."
exec "$@"