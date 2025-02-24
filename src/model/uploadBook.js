const express = require('express');
const app = express();
const mysql = require('mysql2');

app.uploadBook = async (req, res) => {
    console.log(req.body);

    function connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    const db = connect();

    const BOOK_NAME = req.body.bookName;
    const WRITTER = req.body.writter;
    const BOOK_ID = req.body.bookID;
    db.query('DELETE FROM BOOKS WHERE ID = ?', [BOOK_ID]);
    db.query('INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)', [BOOK_ID, BOOK_NAME, WRITTER]);

    
    db.end();
    res.send('Sucsess').status(200);

}


module.exports = app;