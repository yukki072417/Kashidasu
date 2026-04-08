@echo off
chcp 65001 >nul
setlocal ENABLEDELAYEDEXPANSION

REM この .bat が置かれているディレクトリ
set SCRIPT_DIR=%~dp0

REM 2階層上に移動し、絶対パスに正規化
for /f "delims=" %%a in ("%SCRIPT_DIR%..\..") do set ROOT_DIR=%%~fa

set CERT_DIR=%ROOT_DIR%\certs
set CA_INIT=%ROOT_DIR%\ca\init.bat
set LOG_FILE=%ROOT_DIR%\server.log
set ENV_FILE=%ROOT_DIR%\.env

REM -------------------------------
REM 1/5 Node.js バージョン確認
REM -------------------------------
echo [1/5] Node.js バージョンを確認中...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Node.js がインストールされていません
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_CURRENT=%%v
echo ✓ Node.js バージョン: %NODE_CURRENT%

echo %NODE_CURRENT% | findstr /i "v%NODE_VERSION%" >nul
if %errorlevel% neq 0 (
    echo ⚠ 推奨バージョン: %NODE_VERSION%.x
)

REM -------------------------------
REM 2/5 npm install
REM -------------------------------
echo [2/5] 依存パッケージを確認中...

if not exist "%ROOT_DIR%\node_modules" (
    echo ⚠ node_modules が存在しません。インストールします...
    pushd "%ROOT_DIR%"
    call npm install
    call npm audit fix --force
    popd
    echo ✓ 依存パッケージをインストールしました
) else (
    echo ✓ 依存パッケージは既に存在します
)

REM -------------------------------
REM 3/5 SSL 証明書生成（初回のみ）
REM -------------------------------
echo [3/5] SSL 証明書を確認中...

if exist "%CERT_DIR%\server.key" (
    echo ✓ SSL 証明書は既に存在します
) else (
    echo ⚠ SSL 証明書が存在しません。生成します...

    if exist "%CA_INIT%" (
        call "%CA_INIT%"
        if %errorlevel% neq 0 (
            echo ✗ SSL 証明書の生成に失敗しました
            exit /b 1
        )
        echo ✓ SSL 証明書を生成しました
    ) else (
        echo ✗ 証明書生成スクリプトが見つかりません: %CA_INIT%
        exit /b 1
    )
)

REM -------------------------------
REM 4/5 .env チェック
REM -------------------------------
echo [4/5] .env を確認中...

if not exist "%ENV_FILE%" (
    echo ⚠ .env が存在しません。作成します...
    (
        echo PORT=443
        echo BOOKS_API_KEY=kashidasu_api_key_%RANDOM%
        echo NODE_ENV=production
    ) > "%ENV_FILE%"
    echo ✓ .env を作成しました
) else (
    echo ✓ .env は既に存在します
)

echo [%ROOT_DIR%]
echo [5/5] サーバーを起動します...
cd /d "%ROOT_DIR%"
npm start


endlocal
exit /b 0
