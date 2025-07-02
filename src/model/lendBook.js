const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

// 本の貸与エンドポイント
app.LendBook = async (req, res) => {

    //　データベース接続関数
    async function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: "root",
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    // 学籍番号
    const userCode = req.body.user_id;
    // ISBNコード
    const bookCode = req.body.book_id;

    // データベースに接続
    const db = await Connect();

    // 日本時間を格納
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);
    
    //データベースからISBNコードで本を検索
    const searchedBook = await db.query(
        'SELECT * FROM BOOKS WHERE ID = ?',
        [bookCode]
    );

    // データベースから借りているかどうかの検索
    const lendBook = await db.query(
        'SELECT * FROM LENDING_BOOK WHERE BOOK_ID = ?',
        [bookCode]
    );
    
    // 借りられていた時のレスポンス返却処理
    if(lendBook[0] != "") return res.send({result: 'FAILED', message: 'BOOK_ALRADY_LENDING'}).status(200);
    
    // 本が存在しないときのレスポンス返却処理
    if(searchedBook[0] == "") return res.send({result: 'FAILED', message: 'BOOK_NOT_EXIST', requested_data: bookCode}).status(200);

    try{
        // データベースにISBNコード, 学籍番号,　貸出日時を貸与人テーブルに格納
        await db.query(
            'INSERT INTO LENDING_BOOK (BOOK_ID, USER_ID, LEND_DAY) VALUES (?, ?, ?)',
            [bookCode, userCode, date]
        );
        
        //ログに出力
        logger.info(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を貸出しました`);
        console.log(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を貸出しました`);

        //レスポンス返却
        res.send({result: 'SUCCESS'}).status(200);
    }catch(e){
        // 失敗時処理
        console.error(`エラー${e.message}`);
        res.send({result: 'ERROR', error_message: e.message}).status(200);
    } finally {
        // データベースとの接続を切断
        db.end();
    }
}

module.exports = app;