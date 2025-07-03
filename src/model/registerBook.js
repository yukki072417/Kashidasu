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
    const db = await Connect();

    // リクエストボディから本の配列を取得
    const books = req.body.books;
    console.log(books);

    // リクエストのバリデーション（booksが配列でなければエラー）
    if (!books || !Array.isArray(books)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid books data' });
    }

    // 一括登録処理
<<<<<<< HEAD
    RegisterBooksToDB(res, db, books);
=======
    try {
        await RegisterBooksToDB(res, db, books); // 本の配列をDBに登録
    } catch (error) {
        // エラー時はDB接続を閉じる
        db.end();
        console.error('Error during book registration:', error);
        res.status(500).send({ result: 'FAILED', message: 'Internal server error' });
    } finally {
        // 最後に必ずDB接続を閉じる
        db.end();
    }
>>>>>>> 3965e3c0587f9fe4bae186acdc9ec5cec50a9353
};

// データベースに本を登録する関数
async function RegisterBooksToDB(res, db, books) {
<<<<<<< HEAD
=======

    // 日本時間の日付を取得（ログ用）
>>>>>>> 3965e3c0587f9fe4bae186acdc9ec5cec50a9353
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    try {
        for (const book of books) {
            const { isbn, title, author } = book;

            if (!isbn || !title || !author) {
                console.warn('Invalid book data:', book);
                continue;
            }

<<<<<<< HEAD
=======
            // 事前に同じISBNが存在するかチェック
            const [rows] = await db.promise().query(
                'SELECT COUNT(*) AS count FROM BOOKS WHERE ID = ?',
                [isbn]
            );
            if (rows[0].count > 0) {
                // 既に存在する場合はレスポンスを返して処理を中断
                res.send({ result: 'BOOK_ALRADY_EXIST'});
                return;
            }

            // 本をDBに登録（プリペアドステートメントでSQLインジェクション対策）
>>>>>>> 3965e3c0587f9fe4bae186acdc9ec5cec50a9353
            await db.promise().query(
                'INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)',
                [isbn, title, author]
            );
            logger.info(`${date} にISBN ${isbn} の本が正常に登録されました`);
            console.log(`${date} にISBN ${isbn} の本が正常に登録されました`);
        }

<<<<<<< HEAD
=======
        // 全て正常に登録できた場合のみSUCCESSを返す
>>>>>>> 3965e3c0587f9fe4bae186acdc9ec5cec50a9353
        res.send({ result: 'SUCCESS' });
    } catch (error) {
        console.error('エラー:', error);
<<<<<<< HEAD
        db.end();
    } finally {
        db.end();
    }
}

// RegisterBook をエクスポート
module.exports = { RegisterBook };
=======
        throw error; // エラーを上位に投げる
    }
}

module.exports = app;
>>>>>>> 3965e3c0587f9fe4bae186acdc9ec5cec50a9353
