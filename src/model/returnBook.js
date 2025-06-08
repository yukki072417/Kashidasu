const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: "root",
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

app.ReturnBook = async (req, res) => {

    const db = await Connect();
    const reqContent = req.body;
    const userCode = reqContent.user_id;
    const bookCode = reqContent.book_id;
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    const searchedBook = await db.query(
        'SELECT * FROM BOOKS WHERE ID = ?',
        [bookCode]
    );

    console.dir(searchedBook[0]);
    if(searchedBook[0] == "") return res.send({result: 'FAILED', message: 'BOOK_NOT_EXIST', requested_data: bookCode}).status(200);

    try {
        const [results] = await db.query(
            'DELETE FROM LENDING_BOOK WHERE BOOK_ID = ? AND USER_ID = ?',
            [bookCode, userCode]
        );

        if(results.length === 0){
            res.send({result: 'FAILD'})
        }
        
        logger.info(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を正常に返却されました`);
        console.log(`${date} に学籍番号 ${userCode} の人が ISBN ${bookCode} の本を正常に返却されました`);
        res.send({result: 'SUCCESS'}).status(200);
    } catch (e) {
        console.log(e.message);
        res.send({result: 'ERROR' ,error_message: e.message});
    }
}

module.exports = app;