const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const { error } = require('pdf-lib');
const logger = log4js.getLogger('http');

// 本の削除エンドポイント
app.DeleteBook = async (req, res) => {
    //　データベースを接続
    const db = Connect();

    // req.bodyでリクエストボディを取得し、そこからbook_idを変数に格納
    const bookId = req.body.book_id;

    //　本の全削除を有無(bool型が格納される)
    const isAllDelete = req.body.all_delete;

    //　日本時間を格納
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);
    
    //　データベースの接続関数
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: "root",
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }
    
    //　本のデータを全削除の処理
    if(isAllDelete == true) {
        db.query('DELETE FROM BOOKS');
        db.end();
        return res.send([{result: 'SUCCESS'}]).status(200);
    }

    try{
        // 本のISBNコードで特定の本をデータベースから削除
        db.query('DELETE FROM BOOKS WHERE ID = ?', [bookId]);
        
        // ログに出力
        logger.info(`${date}にISBN ${bookId} の本が正常に削除されました`);
        console.log(`${date}にISBN ${bookId} の本が正常に削除されました`);

        //レスポンス返却
        res.send({result: 'SUCCESS'}).status(200);

    } catch(e) {
        // 失敗時処理
        db.end();
        console.error(`エラー: ${e}`)
    } finally {
        // データベースとの接続を切断
        db.end();
    }

}

module.exports = app;