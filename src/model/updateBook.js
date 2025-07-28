const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

// 本の情報の更新処理
app.UploadBook = async (req, res) => {
    
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: "root",
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    // データベースに接続
    const db = Connect();

    // リクエストボディの格納
    const BOOK_ID = req.body.book_id;
    const BEFORE_BOOK_ID = req.body.before_book_id;
    const BOOK_NAME = req.body.book_name;
    const WRITTER = req.body.book_auther;

    try{
        // 更新前のレコードを一時的に削除
        db.query('DELETE FROM BOOKS WHERE ID = ?', [BEFORE_BOOK_ID]);
        // 更新後のレコードを挿入
        db.query('INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)', [BOOK_ID, BOOK_NAME, WRITTER]);
        
        // ログに出力
        logger.info(`ISBN ${BOOK_ID} の本の情報が更新されました`);
        console.log(`ISBN ${BOOK_ID} の本の情報が更新されました`);
        
        // レスポンスの返却処理
        res.send({result: 'SUCCESS'}).status(200);
    }catch(e){

        // エラー時処理
        db.end();
        res.send({result: 'FAILED', message: e.message}).status(200);
    } finally {
        // データベースの接続を切断
        db.end();
    }
}


module.exports = app;