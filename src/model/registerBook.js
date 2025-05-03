const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');
app.use(express.json()); // JSON ボディを解析するためのミドルウェア

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

    const URL = 'http://localhost:80/search-book-isbn';
    const codes = req.body.isbn13_codes;

    if (!codes || !Array.isArray(codes)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid ISBN codes' });
    }

    const data = { isbn13_codes: codes};

    await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(async response => {
            const json = await response.json();
            RegisterBookToDB(res, db, json);
        })
        .catch(error => console.error('Fetch error:', error));

};

async function RegisterBookToDB(res, db, datas) {
    for (let i = 0; i < datas.titles.length; i++) {
        let data = datas.titles[i];

        const isbn = data.isbn.slice(0, 14);
        const title = data.title.slice(0, 30);
        const authors = data.authors.slice(0, 30);

        try {
            await db.promise().query(
                'INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)',
                [isbn, title, authors]
            );
            logger.info(`Book ${isbn} registered successfully on ${new Date().toISOString()}`);
        } catch (error) {
            console.error(`Error inserting data for ISBN ${isbn}:`, error);
        }
    }

    db.end();
    res.send({ result: 'SUCCESS' });
}

module.exports = app;