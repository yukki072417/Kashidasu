require('dotenv').config();

const express = require('express');
const session = require('express-session');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();
const userRouter = require('./router/router');

const logDir = path.join(__dirname, '../logs');
const mysqlDatasDir = path.join(__dirname, '../mysql_datas');

const initUser = require('./model/registerUser');

// logsディレクトリが存在しない場合は作成
if (!fs.existsSync(logDir)) {
    console.log('logsディレクトリを生成');
    fs.mkdirSync(logDir);
}

if(!fs.existsSync(mysqlDatasDir)){
    console.log('mysqlディレクトリを生成')
    fs.mkdirSync(mysqlDatasDir)
}

// log4jsの設定ファイルを読み込む
log4js.configure(`/usr/app/config/config.json`);
const logger = log4js.getLogger('system');

const PORT = 443;
app.use(session({
    secret: 'seacret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

initUser.RegisterInitUser();

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
    logger.info(`Kashidasuサーバーがポート ${PORT} で起動しました`);
    console.log(`Kashidasuサーバーがポート ${PORT} で起動しました`);
});