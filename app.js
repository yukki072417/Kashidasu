const express = require('express');
const session = require('express-session');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const app = express();
const userRouter = require('./src/router/router');
const https = require('https');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

log4js.configure(path.join(__dirname, './config/config.json'));
const logger = log4js.getLogger('system');

require('dotenv').config();

const PORT = 443;

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

const options = {
    key: fs.readFileSync('/usr/app/certs/server.key'),
    cert: fs.readFileSync('/usr/app/certs/server.crt'),
};

https.createServer(options, app).listen(PORT, () => {
    logger.info(`HTTPSサーバーがポート ${PORT} で起動しました`);
    console.log(`HTTPSサーバーがポート ${PORT} で起動しました`);
});
