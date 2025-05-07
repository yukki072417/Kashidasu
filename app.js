const express = require('express');
const session = require('express-session');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const app = express();
const userRouter = require('./src/router/router');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

log4js.configure(path.join(__dirname, './config/config.json'));
const logger = log4js.getLogger('system');

require('dotenv').config();

const PORT = 3000;

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

app.listen(PORT, () => {
    logger.info(`Kashidasu server start now... PORT: ${PORT}`);
    console.log(`Kashidasu server start now... PORT: ${PORT}`);
});
