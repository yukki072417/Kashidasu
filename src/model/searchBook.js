const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

function Connect() {
  return mysql.createConnection({
    host: "db",
    user: "root",
    password: process.env.ROOT_PASSWORD,
    database: "KASHIDASU",
  });
}

app.SearchBook = async (req, res) => {
  const db = await Connect();
  
  try {
    const { book_id, book_num, manual_search_mode } = req.body;

    if (manual_search_mode) {
      await searchSingleBook(db, book_id, res);
    } else {
      await searchAllBooks(db, book_num, res);
    }
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).send({ result: 'FAILED', message: error.message });
  } finally {
    db.end();
  }
};

async function searchSingleBook(db, bookID, res) {
  const [results] = await db.query(
    `SELECT b.*, l.USER_ID, l.LEND_DAY,
     CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
     FROM BOOKS b 
     LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
     WHERE b.ID = ?`,
    [bookID]
  );

  if (results.length === 0) {
    res.send({ result: "FAILED", message: "BOOK_NOT_EXIST" });
  } else {
    res.send(formatBookData(results)[0]);
  }
}

async function searchAllBooks(db, bookNum, res) {
  const [results] = await db.query(`
    SELECT b.*, l.USER_ID, l.LEND_DAY,
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING
    FROM BOOKS b
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID
  `);

  const [recordCount] = await db.query(`SELECT COUNT(ID) FROM BOOKS`);
  if (results.length === 0) {
    res.send([{ result: "BOOK_NOT_EXIST" }]);
  } else {
    const response = [recordCount[0], ...formatBookData(results)];
    res.send(response);
  }
}

function formatBookData(results) {
  return results.map((result) => ({
    book_id: result.ID,
    book_name: result.BOOK_NAME,
    book_auther: result.WRITTER,
    book_is_lending: result.IS_LENDING,
    lending_user_id: result.USER_ID || null,
    lend_date: result.LEND_DAY
  }));
}

module.exports = app;