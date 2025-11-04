const express = require('express');
const app = express();
const mysql = require('mysql2');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

// 本の登録エンドポイント
app.RegisterBook = async (req, res) => {
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

    // リクエストのバリデーション（booksが配列でなければエラー）
    if (!books || !Array.isArray(books)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid books data' });
    }

    // 一括登録処理
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
};

// データベースに本を登録する関数
async function RegisterBooksToDB(res, db, books) {

    // 日本時間の日付を取得（ログ用）
    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).slice(0, 10);

    try {
        for (const book of books) {
            const { isbn, title, author } = book;

            if (!isbn || !title || !author) {
                console.warn('Invalid book data:', book);
                continue;
            }

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
            await db.promise().query(
                'INSERT INTO BOOKS (ID, BOOK_NAME, WRITTER) VALUES (?, ?, ?)',
                [isbn, title, author]
            );
            logger.info(`${date} にISBN ${isbn} の本が正常に登録されました`);
            console.log(`${date} にISBN ${isbn} の本が正常に登録されました`);
        }

        // 全て正常に登録できた場合のみSUCCESSを返す
        res.send({ result: 'SUCCESS' });
    } catch (error) {
        console.error('エラー:', error);
        throw error; // エラーを上位に投げる
    }
}

module.exports = app;
