const express = require('express');
const app = express();
const mysql = require('mysql2');

app.registerBook = async (req, res) => {
    
    function connect() {
        return mysql.createConnection({
            host: "db",
            user: "root",
            password: "ROOT",
            database: "KASHIDASU",
        });
    }

    const db = connect();
    const BOOK_ID = req.body.bookID;
    const BOOK_NAME = req.body.bookName;
    const WRITTER = req.body.writter;

    db.query('INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)', [BOOK_ID, BOOK_NAME, WRITTER]);

    res.send('登録完了');
    db.end();
}

module.exports = app;