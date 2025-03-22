//リファクタリング済

const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const { last } = require('pdf-lib');

app.LendBook = async (req, res) => {

    const userCode = req.body.user_id;
    const bookCode = req.body.book_id;
    const db = await Connect();
    const date = new Date().toISOString().slice(0, 10);

    async function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }
    
    const searchedBook = await db.query(
        'SELECT * FROM BOOKS WHERE ID = ?',
        [bookCode]
    );
    const lendBook = await db.query(
        'SELECT * FROM LENDING_BOOK WHERE BOOK_ID = ?',
        [bookCode]
    );
    
    if(lendBook[0] != "") return res.send({result: 'FAILED', message: 'BOOK_ALRADY_LENDING'}).status(200);
    if(searchedBook[0] == "") return res.send({result: 'FAILED', message: 'BOOK_NOT_EXIST'}).status(200);

    try{
        await db.query(
            'INSERT INTO LENDING_BOOK (BOOK_ID, USER_ID, LEND_DAY) VALUES (?, ?, ?)',
            [bookCode, userCode, date]
        );
        res.send({result: 'SUCCESS'}).status(200);
    }catch(e){
        console.error(e.message);
        res.send({result: 'ERROR', error_message: e.message}).status(200);
    }
    db.end();
}

module.exports = app;