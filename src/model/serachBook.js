const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

async function Connect() {
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
    console.error("エラー:", error);
    res.status(500).send("サーバーエラーが発生しました");
  } finally {
    db.end();
  }
};

async function ManualSearchMode(db, bookID, res) {
  let response = [];

  const [results] = await db.query(
    `
    SELECT b.*, 
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
    FROM BOOKS b 
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
    WHERE b.ID = ?`,
    [bookID]
  );

  if (results.length === 0) {
    res.send({ result: "FAILED", message: "BOOK_NOT_EXIST" });
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
    res.send([{ result: "BOOK_NOT_EXIST" }]);
  } else {
    let response = [];
    const maxSearch = 30 * bookNum;
    const minSearch = 30 * (bookNum - 1);
    let count = 0 + minSearch;

    response.push(recordNum[0]);

    const lendingInformation = await GetLendingBooks(db);
    if (lendingInformation != undefined) {
      for (let i = 0; i < results.length; i++) {
        if (results[i].IS_LENDING == 1) {
          const lendingInfoContent = GetLendingInfo(results, lendingInformation);
          results[i].USER_ID = lendingInfoContent.USER_ID;
          results[i].LEND_DAY = lendingInfoContent.LEND_DAY;
        }
      }
    }
    response = response.concat(FormatResults(results));
    res.send(response);
  }
}

function GetLendingInfo(results, lendingInformation) {
  let isLending_array = [];
  results.forEach((result) => {
    if (result.IS_LENDING == 1) {
      isLending_array.push(result.ID);
    }
  });
  for (let j = 0; j < lendingInformation.length; j++) {
    if (isLending_array[j] == lendingInformation[j].BOOK_ID) {
      const returnData = {
        USER_ID: lendingInformation[j].USER_ID,
        LEND_DAY: lendingInformation[j].LEND_DAY,
      };
      return returnData;
    }
  }
}
function FormatResults(results) {
  if (results[0].USER_ID == undefined) results[0].USER_ID = null;

  return results.map((result) => ({
    book_id: result.ID,
    book_name: result.BOOK_NAME,
    book_auther: result.WRITTER,
    book_is_lending: result.IS_LENDING,
    lending_user_id: result.USER_ID,
    lend_date: result.LEND_DAY
  }));
}

async function GetLendingBooks(db) {
  try {
    const [results] = await db.query("SELECT * FROM LENDING_BOOK");
    return results;
  } catch (error) {
    console.error("エラー:", error);
    throw error;
  }
}

module.exports = app;
