const express = require('express');
const session = require('express-session');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();
const userRouter = require('./src/router/router');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

log4js.configure(path.join(__dirname, './config/config.json'));
const logger = log4js.getLogger('system');

require('dotenv').config();

const HTTPS_PORT = 80;

// HTTPS用の証明書と秘密鍵を読み込む
const options = {
  key: fs.readFileSync('./selfsigned.key'),
  cert: fs.readFileSync('./selfsigned.crt'),
};

app.use(session({
    secret: 'seacret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static('./src/public'));
app.use(express.urlencoded({ extended: true }));
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/', userRouter);

// HTTPSサーバーを起動
https.createServer(options, app).listen(HTTPS_PORT, () => {
    logger.info(`Kashidasu server start now... HTTPS PORT: ${HTTPS_PORT}`);
    console.log(`Kashidasu server start now... HTTPS PORT: ${HTTPS_PORT}`);
});
