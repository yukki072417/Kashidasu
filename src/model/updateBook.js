const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

app.UploadBook = async (req, res) => {
    
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    const db = Connect();

    const BOOK_ID = req.body.book_id;
    const BEFORE_BOOK_ID = req.body.before_book_id;
    const BOOK_NAME = req.body.book_name;
    const WRITTER = req.body.book_auther;

    try{
        db.query('DELETE FROM BOOKS WHERE ID = ?', [BEFORE_BOOK_ID]);
        db.query('INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)', [BOOK_ID, BOOK_NAME, WRITTER]);
        db.end();
        logger.info(`Book ${BOOK_ID} updated successfully`);
        res.send({result: 'SUCCESS'}).status(200);
    }catch(e){
        res.send({result: 'FAILED', message: e.message}).status(200);
    }
}


module.exports = app;