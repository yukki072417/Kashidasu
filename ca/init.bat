@echo off
chcp 65001 >nul
setlocal

REM === OpenSSL のパス（アプリ同梱） ===
set OPENSSL="%~dp0..\openssl\openssl.exe"

REM === 証明書出力先 ===
set CERT_DIR=%~dp0..\certs
if not exist "%CERT_DIR%" mkdir "%CERT_DIR%"

echo === Creating CA ===
%OPENSSL% genrsa -out "%CERT_DIR%\ca.key" 2048

%OPENSSL% req -x509 -new -nodes ^
  -key "%CERT_DIR%\ca.key" ^
  -sha256 -days 3650 ^
  -out "%CERT_DIR%\ca.crt" ^
  -subj "/CN=LocalDevCA"

echo === Creating server certificate ===
%OPENSSL% genrsa -out "%CERT_DIR%\server.key" 2048

%OPENSSL% req -new ^
  -key "%CERT_DIR%\server.key" ^
  -out "%CERT_DIR%\server.csr" ^
  -config "%~dp0openssl.cnf"

%OPENSSL% x509 -req ^
  -in "%CERT_DIR%\server.csr" ^
  -CA "%CERT_DIR%\ca.crt" ^
  -CAkey "%CERT_DIR%\ca.key" ^
  -CAcreateserial ^
  -out "%CERT_DIR%\server.crt" ^
  -days 365 ^
  -sha256 ^
  -extfile "%~dp0openssl.cnf" ^
  -extensions req_ext

echo 完了: %CERT_DIR%
endlocal
