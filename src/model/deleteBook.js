const express = require('express');
const app = express();
const mysql = require('mysql2');

app.DeleteBook = async (req, res) => {
    
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
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

    const db = Connect();
    const bookId = req.body.book_id;

    db.query('DELETE FROM BOOKS WHERE ID = ?', [bookId]);
    db.end();
    res.send([{result: 'SUCCESS'}]).status(200);

}

module.exports = app;