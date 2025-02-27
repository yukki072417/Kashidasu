//リファクタリング済

const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

app.LendBook = async (req, res) => {

    const reqContent = req.body;
    const userCode = reqContent.user_id;
    const bookCode = reqContent.book_id;
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

    try{
        await db.query(
            'INSERT INTO LENDING_BOOK (BOOK_ID, USER_ID, LEND_DAY) VALUES (?, ?, ?)',
            [bookCode, userCode, date]
        );
        res.send(
            [{result: 'SUCCESS'}]
        ).status(200);
    }catch(e){
        console.error(e.message);
        res.send(
            [{result: 'ERROR', error_message: e.message}]
        ).status(200);
    }
    db.end();
}

module.exports = app;