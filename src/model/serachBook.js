//リファクタリング済

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
  const [results] = await db.query(`
    SELECT b.*, 
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
    FROM BOOKS b 
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID
  `);
  const [recordNum] = await db.query(`SELECT COUNT(ID) FROM BOOKS`);

  if (results.length === 0) {
    res.send([{ result: 'BOOK_NOT_EXIST' }]);

  } else {
    let response = [];
    const maxSearch = 30 * bookNum;
    const minSearch = 30 * (bookNum - 1);
    let count = 0 + minSearch;

    response.push(recordNum[0]);
    
    const lendingInformation = await GetLendingBooks(db);
    if(lendingInformation != undefined) results[0].USER_ID = lendingInformation.USER_ID;

    response = response.concat(FormatResults(results));    
    res.send(response);
  }
}

function FormatResults(results) {

  if(results[0].USER_ID == undefined) results[0].USER_ID = null;
  
  return results.map(result => ({
    book_id: result.ID,
    book_name: result.BOOK_NAME,
    book_auther: result.WRITTER,
    book_is_lending: result.IS_LENDING,
    lending_user_id: result.USER_ID
  }));
}

async function GetLendingBooks(db) {
  try {
    const [results] = await db.query('SELECT * FROM LENDING_BOOK');
    return results[0];
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

module.exports = app;