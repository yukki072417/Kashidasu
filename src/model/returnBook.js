const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: process.env.DB_USER,
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

app.ReturnBook = async (req, res) => {
    console.log(req.body);

    const db = await Connect();
    const reqContent = req.body;
    const userCode = reqContent.user_id;
    const bookCode = reqContent.book_id;

    try {
        const [results] = await db.query(
            'DELETE FROM LENDING_BOOK WHERE BOOK_ID = ? AND USER_ID = ?',
            [bookCode, userCode]
        );

        if(results.length === 0){
            res.send({result: 'FAILD'})
        }
        
        res.send({result: 'SUCCESS'}).status(200);
    } catch (e) {
        console.log(e.message);
        res.send({result: 'ERROR' ,error_message: e.message});
    }
}

module.exports = app;