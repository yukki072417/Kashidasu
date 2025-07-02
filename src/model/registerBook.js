const express = require('express');
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

// 本の登録エンドポイント
const RegisterBook = (req, res) => {
    // データベース接続関数
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: "root",
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    // データベースに接続
    const db = Connect();

    // リクエストボディから本の配列を取得
    const books = req.body.books;
    console.log(books);

    // リクエストのバリデーション（booksが配列でなければエラー）
    if (!books || !Array.isArray(books)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid books data' });
    }

    // 一括登録処理
    RegisterBooksToDB(res, db, books);
};

// データベースに本を登録する関数
async function RegisterBooksToDB(res, db, books) {
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    try {
        for (const book of books) {
            const { isbn, title, author } = book;

            if (!isbn || !title || !author) {
                console.warn('Invalid book data:', book);
                continue;
            }

            await db.promise().query(
                'INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)',
                [isbn, title, author]
            );
            logger.info(`${date} にISBN ${isbn} の本が正常に登録されました`);
            console.log(`${date} にISBN ${isbn} の本が正常に登録されました`);
        }

        res.send({ result: 'SUCCESS' });
    } catch (error) {
        console.error('エラー:', error);
        db.end();
    } finally {
        db.end();
    }
}

// RegisterBook をエクスポート
module.exports = { RegisterBook };