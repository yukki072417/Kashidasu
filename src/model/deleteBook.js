const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

app.DeleteBook = async (req, res) => {
    const db = Connect();
    const bookId = req.body.book_id;
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);
    
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: "root",
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    if(req.body.all_delete != undefined) {
        const db = Connect();
        db.query('DELETE FROM BOOKS');
        db.end();
        res.send([{result: 'SUCCESS'}]).status(200);
        return;
    }

    db.query('DELETE FROM BOOKS WHERE ID = ?', [bookId]);
    db.end();
    res.send([{result: 'SUCCESS'}]).status(200);
    logger.info(`${date}にISBN ${bookId} の本が正常に削除されました`);
    console.log(`${date}にISBN ${bookId} の本が正常に削除されました`);
}

module.exports = app;