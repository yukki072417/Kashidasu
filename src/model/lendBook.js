const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

app.lendBook = async (req, res) => {

    const reqContent = req.body;
    const userCode = reqContent.userCode;
    const bookCode = reqContent.bookCode;
    const db = await connect();
    const DATE = new Date().toISOString().slice(0, 10);

    function connect() {
        return mysql.createConnection({
            host: "db",
            user: "root",
            password: "ROOT",
            database: "KASHIDASU",
        });
    }

    console.log(reqContent);

    try{
        await db.query(
            'INSERT INTO LENDING_BOOK (BOOK_ID, USER_ID, LEND_DAY) VALUES (?, ?, ?)',
            [bookCode, userCode, DATE]
        );
        res.send('Success');
    }catch(e){
        console.log(e.message);
        res.send(e.message)
    }
    
    db.end();

}

module.exports = app;