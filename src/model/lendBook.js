const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const log4js = require('log4js');
const logger = log4js.getLogger('http');

app.use(express.json());

// データベース接続関数
async function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: "root",
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

// 本の貸出処理
const LendBook = async (req, res) => {
    const db = await Connect();
    console.log('LendBook関数呼ばれた');
    try {
        console.log('リクエストボディ', req.body);
        const userCode = req.body.user_id;
        const bookCode = req.body.book_id;

        if (!userCode || !bookCode) {
            return res.status(400).send({ result: 'FAILED', message: 'Missing user_id or book_id' });
        }

        // 本が存在するかチェック
        const [bookRows] = await db.query('SELECT * FROM BOOKS WHERE ID = ?', [bookCode]);
        if (bookRows.length === 0) {
            return res.send({ result: 'FAILED', message: 'BOOK_NOT_EXIST' });
        }

        // 本がすでに貸出中かチェック (LEND_DAY がある＝まだ返却されていないとみなす)
        const [lendRows] = await db.query(
            'SELECT * FROM LENDING_BOOK WHERE BOOK_ID = ?',
            [bookCode]
        );
        if (lendRows.length > 0) {
            return res.send({ result: 'FAILED', message: 'BOOK_ALREADY_LENDING' });
        }

        // 図書委員か判定
        const [adminRows] = await db.query('SELECT * FROM ADMIN_USER WHERE ID = ?', [userCode]);
        const isLibrarian = adminRows.length > 0; // trueなら図書委員
        
        // 貸出期間を設定（今回は返却予定日は DB に保存しない）
        const today = new Date();
        const lendPeriod = isLibrarian ? 21 : 14; // 21日=3週間, 14日=2週間
        const returnDate = new Date(today.getTime() + lendPeriod * 24 * 60 * 60 * 1000);
        const formattedReturnDate = returnDate.toISOString().slice(0, 10);

        const formattedToday = today.toISOString().slice(0, 10);

        // DBに登録（RETURN_DAYを削除してLEND_DAYのみ保存）
        await db.query(
            'INSERT INTO LENDING_BOOK (BOOK_ID, USER_ID, LEND_DAY) VALUES (?, ?, ?)',
            [bookCode, userCode, formattedToday]
        );

        logger.info(`${formattedToday} 学籍番号 ${userCode} が ISBN ${bookCode} を貸出しました`);
        res.send({ result: 'SUCCESS', return_date: formattedReturnDate, is_librarian: isLibrarian });
    } catch (error) {
        console.error('貸出処理エラー:', error);
        res.status(500).send({ result: 'ERROR', message: error.message });
    } finally {
        await db.end();
    }
};

module.exports = { LendBook };
