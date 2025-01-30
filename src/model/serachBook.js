const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

function connect() {
  return mysql.createConnection({
    host: "db",
    user: "root",
    password: "ROOT",
    database: "KASHIDASU",
  });
}

app.searchBook = async (req, res) => {
  try {
    const reqContent = req.body;
    const bookID = reqContent.bookID;
    const bookNum = reqContent.bookNum;
    const searchMode = reqContent.manualSearchMode;

    const db = await connect();

    switch (searchMode) {
      case true:
        manualSearchMode();
        break;
      case false:
        autoSearchMode();
        break;
    }

    async function manualSearchMode() {
      const [results] = await db.query(`
        SELECT b.*, 
        CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
        FROM BOOKS b 
        LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
        WHERE b.ID = ?`, 
        [bookID]
      );

      if (results.length === 0) {
        res.send("NOT_EXIST_BOOK");
      } else {
        res.send(results[0]);
      }
      
      db.end();
    }

    async function autoSearchMode() {
      const [results] = await db.query(`
        SELECT b.*, 
        CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
        FROM BOOKS b 
        LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID
      `);
      const [recordNum] = await db.query(`SELECT COUNT(ID) FROM BOOKS`);

      if ([results[0]] == "") return;
      else returnResponse();
      db.end();

      function returnResponse() {
        let response = [];

        const maxSearch = 30 * bookNum;
        const minSearch = 30 * (bookNum - 1);
        let count = 0 + minSearch;

        response.push(recordNum[0]);

        while ([results].length < maxSearch) {
          if (count < maxSearch) {
            response.push(results[count]);
          } else {
            break;
          }
          count++;
        }
        res.send(response);
      }
    }
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).send('サーバーエラーが発生しました');
  }
}

module.exports = app;
