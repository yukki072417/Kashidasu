const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

async function Connect() {
  return mysql.createConnection({
    host: 'db',
    user: process.env.DB_USER,
    password: process.env.ROOT_PASSWORD,
    database: 'KASHIDASU'
  });
}

app.SearchBook = async (req, res) => {
  const db = await Connect();
  try {
    const reqContent = req.body;
    const bookID = reqContent.book_id;
    const bookNum = reqContent.book_num;
    const searchMode = reqContent.manual_search_mode;

    if (searchMode) {
      await ManualSearchMode(db, bookID, res);
    } else {
      await AutoSearchMode(db, bookNum, res);
    }

  } catch (error) {
    console.error('エラー:', error);
    res.status(500).send('サーバーエラーが発生しました');
  } finally {
    db.end();
  }
}
// 特定の本を1件検索するときの関数
async function ManualSearchMode(db, bookID, res) {
  let response = [];

  const [results] = await db.query(`
    SELECT b.*, 
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
    FROM BOOKS b 
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
    WHERE b.ID = ?`,
    [bookID]
  );

  if (results.length === 0) {
    res.send({ result: 'FAILED', message: 'BOOK_NOT_EXIST' });
  } else {
    response = FormatResults(results);
    res.send(response[0]);
  }
}
async function AutoSearchMode(db, bookNum, res) {
  // 本の情報と貸出情報を分かりやすく取得
  const [results] = await db.query(`
    SELECT 
      b.ID AS book_id,
      b.BOOK_NAME AS book_name,
      b.WRITTER AS book_author,
      l.USER_ID AS lending_user_id,
      l.LEND_DATE AS lend_date,
      l.DEAD_LINE AS dead_line
    FROM BOOKS b
    LEFT JOIN LENDING_BOOK l
      ON b.ID = l.BOOK_ID
  `);

  // 本の総数も取得
  const [recordNum] = await db.query(`SELECT COUNT(ID) AS total FROM BOOKS`);

  if (results.length === 0) {
    res.send([{ result: 'BOOK_NOT_EXIST' }]);
  } else {
    // ページング処理
    const maxSearch = 30 * bookNum;
    const minSearch = 30 * (bookNum - 1);

    // 30件ずつ切り出し
    const pageResults = results.slice(minSearch, maxSearch);

    // レスポンスを分かりやすく整形
    const response = {
      total: recordNum[0].total,
      books: pageResults.map(result => {
        return {
          book_id:         result.book_id,
          book_name:       result.book_name,
          book_author:     result.book_author,
          is_lending:      result.lending_user_id ? true : false,
          lending_user_id: result.lending_user_id || null,
          lend_date:       result.lend_date || null,
          dead_line:       result.dead_line || null 
        };
      })
    };

    res.send(response);
  }
}

function FormatResults(results) {
  if (results[0].USER_ID == undefined) results[0].USER_ID = null;
  console.log(results);

  return results.map(result => ({
    book_id: result.ID,
    book_name: result.BOOK_NAME,
    book_auther: result.WRITTER,
    book_is_lending: result.IS_LENDING,
    lending_user_id: result.USER_ID,
  }));
}

async function GetLendingBooks(db) {
  try {
    const [results] = await db.query('SELECT * FROM LENDING_BOOK');
    return results;
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

module.exports = app;