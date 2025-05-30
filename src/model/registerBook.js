const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');
app.use(express.json()); // JSON ボディを解析するためのミドルウェア

app.RegisterBook = async (req, res) => {
    console.log(req.body);

    // データベース接続関数
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: process.env.DB_USER,
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    const db = Connect();
    const books = req.body.books;

    // リクエストのバリデーション
    if (!books || !Array.isArray(books)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid books data' });
    }

    // 一括登録処理
    try {
        await RegisterBooksToDB(res, db, books);
    } catch (error) {
        console.error('Error during book registration:', error);
        res.status(500).send({ result: 'FAILED', message: 'Internal server error' });
    }
};

// データベースに本を登録する関数
async function RegisterBooksToDB(res, db, books) {
    const insertQuery = 'INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)';
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    try {
        for (const book of books) {
            const { isbn, title, author } = book;

            if (!isbn || !title || !author) {
                console.warn('Invalid book data:', book);
                continue;
            }

            await db.promise().query(insertQuery, [isbn, title, author]);
            logger.info(`${date} にISBN ${isbn} の本が正常に登録されました`);
            console.log(`${date} にISBN ${isbn} の本が正常に登録されました`);
        }

        res.send({ result: 'SUCCESS' });
    } catch (error) {
        console.error('Error inserting books into database:', error);
        throw error;
    } finally {
        db.end(); // データベース接続を確実に終了
    }
}

module.exports = app;