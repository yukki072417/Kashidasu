const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('access');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

// RSA秘密鍵のパス
const PRIVATE_KEY_PATH = "/usr/app/certs/rsa_private.pem";

// 秘密鍵を取得する関数
function getPrivateKey() {
    try {
        return fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    } catch (error) {
        console.error("秘密鍵の読み込み中にエラーが発生しました:", error.message);
        process.exit(1);
    }
}

// RSA複合化関数
function decryptRSA(encrypted) {
    const privateKey = getPrivateKey();
    return crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        },
        Buffer.from(encrypted, 'base64')
    ).toString('utf8');
}

// データベース接続関数
function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

//ログイン処理のエンドポイント
app.Login = async (req, res) => {
    // データベースに接続
    const db = await Connect();

    // 管理者ID, パスワードのリクエストボディを変数に格納
    const { admin_id, admin_password } = req.body;

    if(admin_id == null || admin_password == null) {
        res.send({result: 'FAILED'});
        return;
    }

    // ID（学籍番号）とパスワードの検証
    try {
        // データベースからユーザー情報を取得
        const [results] = await db.query(
            'SELECT * FROM ADMIN_USER WHERE ID = ?',
            [admin_id]
        );
        const user = results[0];

        // ユーザーが存在しない場合の処理
        if (!user) {
            return res.status(200).send([{result: 'FAILED'}]);
        }

        // パスワードのハッシュ照合
        const passwordMatch = await bcrypt.compare(admin_password, user.PASSWORD);
        if (admin_id === user.ID && passwordMatch) {
            // 名前をRSA複合化
            const lastName = decryptRSA(user.LAST_NAME);
            const firstName = decryptRSA(user.FIRST_NAME);

            // ログインしている人をセッションに格納
            req.session.admin_id = admin_id;
            req.session.admin_authed = true;

            logger.info(`${lastName} ${firstName} がKashidasuにログインしました`);
            console.log(`${lastName} ${firstName} がKashidasuにログインしました`);

            // メインページにリダイレクト
            return res.redirect('/main');
        } else {
            return res.status(200).send({result: 'FAILED'});
        }

    } catch (error) {
        // 失敗時処理
        console.error('データベースエラー:', error.message);
        db.end();
        return res.status(200).send({result: 'ERROR', error: error.message});
    } finally {
        // データベースとの接続を閉じる
        db.end();
    }
};

// 認証ミドルウェア
function requireAuth(req, res, next) {
    if (req.session.admin_authed)
        next();
    else
        res.redirect('/login');
}

// メインページのレンダリング（名前を複合化して渡す）
async function renderMainPage(req, res) {
    const mysql = require('mysql2/promise');
    const db = await mysql.createConnection({
        host: 'db',
        user: 'root',
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU',
    });

    try {
        const [rows] = await db.execute(
            'SELECT FIRST_NAME, LAST_NAME FROM ADMIN_USER WHERE ID = ?',
            [req.session.admin_id]
        );

        let firstName = '';
        let lastName = '';
        if (rows.length > 0) {
            firstName = decryptRSA(rows[0].FIRST_NAME);
            lastName = decryptRSA(rows[0].LAST_NAME);
        }

        res.render('Main', { resData: { id: req.session.admin_id, firstName, lastName } });
    } catch (err) {
        console.error(err);
        res.status(500).send('DB error');
    } finally {
        await db.end();
    }
}

module.exports = {
    ...app,
    requireAuth,
    renderMainPage
};