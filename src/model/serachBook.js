const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

function Connect() {
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
    console.log(reqContent);


    switch (searchMode) {
      case true:
        ManualSearchMode();
        break;
      case false:
        AutoSearchMode();
        break;
    }

    async function ManualSearchMode() {
      const [results] = await db.query(`
        SELECT b.*, 
        CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
        FROM BOOKS b 
        LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
        WHERE b.ID = ?`, 
        [bookID]
      );

      if (results.length === 0) {
        res.send(
          [{result: 'FAILD'}]
        );
      } else {

        //ここに注目して修正
        console.log(results[0]);
        res.send(results[0]);
      }
      
      db.end();
    }

    async function AutoSearchMode() {
      const [results] = await db.query(`
        SELECT b.*, 
        CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
        FROM BOOKS b 
        LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID
      `);
      const [recordNum] = await db.query(`SELECT COUNT(ID) FROM BOOKS`);

      if (results[0] == "") return;
      else ReturnResponse();
      db.end();

      function ReturnResponse() {
        let response = [];

        const maxSearch = 30 * bookNum;
        const minSearch = 30 * (bookNum - 1);
        let count = 0 + minSearch;

        response.push(recordNum[0]);
        
        while ([results].length < maxSearch) {
          if (count < maxSearch) {
            console.log(results[count]);
            let data = {
              book_id: results[count].ID,
              book_name: results[count].BOOK_NAME,
              book_auther: results[count].WRITTER,
              book_is_lending: results[count].IS_LENDING
            }
            response.push(data);
            console.log(response);
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
