//リファクタリング済

const express = require('express');
const app = express();
const mysql = require('mysql2');

app.RegisterBook = async (req, res) => {
    
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    const db = Connect();
    const bookId = req.body.book_id;
    const bookName = req.body.book_name;
    const bookAuther = req.body.book_auther;

    try{
        db.query('INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)', [bookId, bookName, bookAuther]);
        res.send(
            [{result: 'SUCCESS'}]
        );
    }catch(error){
        console.error(error.message);
        res.send(
            [{result: 'FAILD', error_message: error.message}]
        );
    }

    db.end();
}

module.exports = app;