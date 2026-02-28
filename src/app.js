require("dotenv").config();

const express = require("express");
const session = require("express-session");
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const app = express();

const logDir = path.join(__dirname, "../logs");

const userRoutes = require("./router/userRoutes");
const bookRoutes = require("./router/bookRoutes");
const adminRoutes = require("./router/adminRoutes");
const pageRoutes = require("./router/pageRoutes");
const apiRoutes = require("./router/apiRoutes"); // 新しいapiRoutesをインポート

const initDb = require("./db/init");
const PORT = 443;

app.use(express.static("./src/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "seacret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes); // apiRoutesをマウント
app.use("/", pageRoutes);

// logsディレクトリが存在しない場合は作成
if (!fs.existsSync(logDir)) {
  console.log("logsディレクトリを生成");
  fs.mkdirSync(logDir);
}

// log4jsの設定ファイルを読み込む
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
