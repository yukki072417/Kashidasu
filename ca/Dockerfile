FROM alpine:latest

RUN apk add --no-cache openssl
WORKDIR /root/ca

# エントリースクリプトとOpenSSL設定ファイルをコピー
COPY entrypoint.sh /root/ca/entrypoint.sh
COPY openssl.cnf /root/ca/openssl.cnf

RUN chmod +x /root/ca/entrypoint.sh

ENTRYPOINT ["/root/ca/entrypoint.sh"]
