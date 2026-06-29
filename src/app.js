require("dotenv").config();

const express = require("express");
const session = require("express-session");
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const cors = require("cors");

const app = express();

const logDir = path.join(__dirname, "../logs");
const bootstrapMarker = path.join(logDir, ".startup-complete");

const bookRoutes = require("./router/bookRoutes");
const userRoutes = require("./router/userRoutes");
const adminRoutes = require("./router/adminRoutes");
const pageRoutes = require("./router/pageRoutes");
const apiRoutes = require("./router/apiRoutes");
const publicRoutes = require("./router/publicRoutes");

const initDb = require("./db/init");
const PORT = process.env.PORT;

function startServer() {
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(bootstrapMarker, new Date().toISOString(), "utf8");

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

app.use(
  cors({
    origin: [
      "https://localhost:443",
      "https://127.0.0.1:443",
      process.env.DOMAIN,
    ],
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
      maxAge: 1000 * 60 * 60 * 24,
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

startServer();
