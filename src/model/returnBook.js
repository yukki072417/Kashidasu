const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

// データベース接続関数
function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: "root",
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

// 本の返却時処理
app.ReturnBook = async (req, res) => {

    // データベースに接続
    const db = await Connect();

    // リクエストボディを格納 
    const reqContent = req.body;
    const userCode = reqContent.user_id;
    const bookCode = reqContent.book_id;
    
    // 日本時間を格納
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    // データベース検索処理
    const searchedBook = await db.query(
        'SELECT * FROM BOOKS WHERE ID = ?',
        [bookCode]
    );

    // 本が存在しないときの処理
    if(searchedBook[0] == "") return res.send({result: 'FAILED', message: 'BOOK_NOT_EXIST', requested_data: bookCode}).status(200);

    try {
        // 貸し出されている本が記録されたテーブル（LENDING_BOOK)の
        const [results] = await db.query(
            'DELETE FROM LENDING_BOOK WHERE BOOK_ID = ? AND USER_ID = ?',
            [bookCode, userCode]
        );

        // 本が貸し出されていないときの処理
        if(results.length === 0) res.send({result: 'FAILED', message: 'BOOK_NOT_LENDING'});
        
        logger.info(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を正常に返却されました`);
        console.log(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を正常に返却されました`);
        res.send({result: 'SUCCESS'}).status(200);
    } catch (e) {
        // 失敗時処理
        db.end();
        console.error(`エラー: ${e.message}`);
        res.send({result: 'ERROR' ,error_message: e.message});
    } finally {
        // データベースとの接続を切断
        db.end();
    }
}

module.exports = app;