const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('access');
require('dotenv').config();

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

    if(admin_id == null || admin_password == null) res.send({result: 'FAILED'});
    
    // ID（学籍番号）とパスワードの検証
    try {
        
        // データベースからパスワードを取得
        const [results] = await db.query(
            'SELECT ID, PASSWORD FROM ADMIN_USER WHERE ID = ?',
            [admin_id]
        );
        const user = results[0];
        
        // ユーザーが存在しない場合の処理
        if (results.length === 0) {
            return res.status(200).send([{result: 'FAILED'}]);
        }
        
        //　IDとパスワードの検証
        if (admin_id === user.ID && admin_password === user.PASSWORD) {

            // ログインしている人をセッションに格納
            req.session.admin_id = admin_id;

            //ログインセッションをtrue（これでログイン状態が保持される）
            req.session.admin_authed = true;

            // ログに出力
            logger.info(`学籍番号 ${admin_id} の人がKashidasuにログインしました`);
            console.log(`学籍番号 ${admin_id} の人がKashidasuにログインしました`);

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

module.exports = app;