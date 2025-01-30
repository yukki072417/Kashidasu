const express = require('express');
const app = express();
const mysql = require('mysql2');

app.deleteBook = async (req, res) => {

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
    db.query('DELETE FROM BOOKS WHERE ID = ?', [BOOK_ID]);

    
    db.end();
    res.send('Sucsess').status(200);

}


module.exports = app;