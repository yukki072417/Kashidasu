const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

function connect() {
    return mysql.createConnection({
        host: "db",
        user: "root",
        password: "ROOT",
        database: "KASHIDASU",
    });
}

app.returnBook = async (req, res) => {
    console.log(req.body);

    const db = await connect();
    const reqContent = req.body;
    const userCode = reqContent.userCode;
    const bookCode = reqContent.bookCode;

    try {
        await db.query(
            'DELETE FROM LENDING_BOOK WHERE BOOK_ID = ? AND USER_ID = ?',
            [bookCode, userCode]
        );
        res.send('Success');
    } catch (e) {
        console.log(e.message);
        res.send(e.message);
    }
}

module.exports = app;