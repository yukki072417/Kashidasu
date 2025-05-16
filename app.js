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

const HTTPS_PORT = 443;

// HTTPS用の証明書と秘密鍵を読み込む
const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt'),
};

const LEX = require('letsencrypt-express');
const DOMAIN = '10.100.240.128';
const EMAIL = 'user@example.com';

const lex = LEX.create({
    server: 'https://acme-staging-v02.api.letsencrypt.org/directory', // ステージング環境（テスト用）
    configDir: require('os').homedir() + '/letsencrypt/etc',
    approveRegistration: function (hostname, approve) {
        if (hostname === DOMAIN) {
            approve(null, {
                domains: [DOMAIN],
                email: EMAIL,
                agreeTos: true,
            });
        }
    },
});

app.use(session({
    secret: 'seacret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static('./src/public'));
app.use(express.urlencoded({ extended: true }));
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/', userRouter);

// HTTPSサーバーを起動
const httpsServer = lex.createHttpsServer({}, (req, res) => {
    res.end('Hello, HTTPS with Let\'s Encrypt!');
});

httpsServer.listen(443, () => {
    console.log(`HTTPS Server running on https://${DOMAIN}`);
});
