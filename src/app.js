/**
 * Kashidasuアプリケーションのメインファイル
 * Expressサーバーを起動し、各種ミドルウェアとルートを設定する
 */
require("dotenv").config();

const { spawnSync } = require("child_process");
const express = require("express");
const session = require("express-session");
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const cors = require("cors");

const app = express();

const rootDir = path.join(__dirname, "..");
const logDir = path.join(__dirname, "../logs");
const bootstrapMarker = path.join(logDir, ".startup-complete");
const commandsDir = path.join(rootDir, "commands");

const bookRoutes = require("./router/bookRoutes");
const userRoutes = require("./router/userRoutes");
const adminRoutes = require("./router/adminRoutes");
const pageRoutes = require("./router/pageRoutes");
const apiRoutes = require("./router/apiRoutes");
const publicRoutes = require("./router/publicRoutes");

const initDb = require("./db/init");
const PORT = process.env.PORT;

function runInitialBootstrap() {
  const bootstrapRequired =
    !fs.existsSync(bootstrapMarker) ||
    !fs.existsSync(path.join(rootDir, "certs", "server.key")) ||
    !fs.existsSync(path.join(rootDir, "certs", "server.crt")) ||
    !fs.existsSync(path.join(rootDir, ".env"));

  if (!bootstrapRequired) {
    return true;
  }

  const isWindows = process.platform === "win32";
  const bootstrapScript = isWindows
    ? path.join(commandsDir, "win", "start.bat")
    : path.join(commandsDir, "posix", "start.sh");

  if (!fs.existsSync(bootstrapScript)) {
    console.error(`初回起動用スクリプトが見つかりません: ${bootstrapScript}`);
    return false;
  }

  const result = isWindows
    ? spawnSync("cmd.exe", ["/c", bootstrapScript], {
        cwd: rootDir,
        env: {
          ...process.env,
          KASHIDASU_BOOTSTRAP_ONLY: "1",
        },
        stdio: "inherit",
      })
    : spawnSync("bash", [bootstrapScript], {
        cwd: rootDir,
        env: {
          ...process.env,
          KASHIDASU_BOOTSTRAP_ONLY: "1",
        },
        stdio: "inherit",
      });

  if (result.error) {
    console.error("初回起動スクリプトの実行に失敗しました", result.error);
    return false;
  }

  if (result.status !== 0) {
    console.error(`初回起動スクリプトが異常終了しました: ${result.status}`);
    return false;
  }

  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(bootstrapMarker, new Date().toISOString(), "utf8");
  return true;
}

function startServer() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  log4js.configure(path.join(__dirname, "../config/logs.json"));
  const logger = log4js.getLogger("system");

  const options = {
    key: fs.readFileSync(path.join(__dirname, "../certs/server.key")),
    cert: fs.readFileSync(path.join(__dirname, "../certs/server.crt")),
  };

  https.createServer(options, app).listen(PORT, () => {
    logger.info(`Kashidasuサーバーがポート ${PORT} で起動しました`);
    console.log(`Kashidasuサーバーがポート ${PORT} で起動しました`);
    initDb.initDb();
  });
}

app.use(express.static("./src/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS設定
app.use(
  cors({
    origin: [
      "https://localhost:443",
      "https://127.0.0.1:443",
      process.env.DOMAIN,
    ], // 本番環境のドメインを追加
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  session({
    secret: "seacret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 1000 * 60 * 60 * 24, // 24時間の有効期限（ミリ秒単位）
    },
  }),
);

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);
app.use("/public", publicRoutes);
app.use("/", pageRoutes);

if (runInitialBootstrap()) {
  startServer();
}
