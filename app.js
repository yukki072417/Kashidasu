const express = require('express');
const session = require('express-session');
const app = express();
const userRouter = require('./src/router/router');
const log4js = require('log4js');
const logger = log4js.getLogger();

logger.level = "trace";
require('dotenv').config();

const PORT = 80;

app.use(session({
    secret: 'seacret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 24hours
    }
}));

app.use(express.static('./src/public'));

app.use(express.urlencoded({ extended: true}));
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/', userRouter);

app.listen(PORT, (req,res) => {
    logger.info(`Kashidasu server start now... PORT: ${PORT}`);
});
