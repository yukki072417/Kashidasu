// 必要なモジュールを読み込み
const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

// データベース接続関数
async function Connect() {
  // MySQLサーバーに接続
  return mysql.createConnection({
    host: "db",
    user: "root",
    password: process.env.ROOT_PASSWORD,
    database: "KASHIDASU",
  });
}

// 本の検索処理（エンドポイント）
app.SearchBook = async (req, res) => {
  // データベースに接続
  const db = await Connect();
  
  try {
    // リクエストボディから検索条件を取得
    const reqContent = req.body;
    const bookID = reqContent.book_id;
    const bookNum = reqContent.book_num;
    const searchMode = reqContent.manual_search_mode;

    // manual_search_modeがtrueなら1冊検索、falseなら複数検索
    if (searchMode) {
      await ManualSearchMode(db, bookID, res);
    } else {
      await AutoSearchMode(db, bookNum, res);
    }
  } catch (error) {
    // エラー発生時の処理
    db.end();
    console.error("エラー:", error);
    res.status(500).send({result: 'FAILED', message: error});
  } finally {
    // データベース接続を必ず切断
    db.end();
  }
};

// 特定の本（1冊）を検索する処理
async function ManualSearchMode(db, bookID, res) {
  let response = [];

  // 指定した本の情報と貸出中かどうかを取得
  const [results] = await db.query(
    `
    SELECT b.*, 
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
    FROM BOOKS b 
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID 
    WHERE b.ID = ?
    `,
    [bookID]
  );

  // 本が存在しない場合
  if (results.length === 0) {
    res.send({ result: "FAILED", message: "BOOK_NOT_EXIST" });
  } else {
    // 本が存在する場合は整形して返す
    response = FormatResults(results);
    res.send(response[0]);
  }
}

// 複数の本をページングして検索する処理
async function AutoSearchMode(db, bookNum, res) {
  // 全ての本の情報と貸出中かどうかを取得
  const [results] = await db.query(`
    SELECT b.*, 
    CASE WHEN l.BOOK_ID IS NOT NULL THEN TRUE ELSE FALSE END AS IS_LENDING 
    FROM BOOKS b 
    LEFT JOIN LENDING_BOOK l ON b.ID = l.BOOK_ID
  `);
  // 総レコード数を取得
  const [recordNum] = await db.query(`SELECT COUNT(ID) FROM BOOKS`);

  // 本が存在しない場合
  if (results.length === 0) {
    res.send([{ result: "BOOK_NOT_EXIST" }]);
  } else {
    let response = [];
    // ページングのための範囲を計算
    const maxSearch = 30 * bookNum;
    const minSearch = 30 * (bookNum - 1);
    let count = 0 + minSearch;

    // 総レコード数を最初の要素として追加
    response.push(recordNum[0]);

    // 貸出情報を取得
    const lendingInformation = await GetLendingBooks(db);
    if (lendingInformation != undefined) {
      // 貸出中の本にはユーザーIDと貸出日を付与
      for (let i = 0; i < results.length; i++) {
        if (results[i].IS_LENDING == 1) {
          const lendingInfoContent = GetLendingInfo(results, lendingInformation);
          results[i].USER_ID = lendingInfoContent.USER_ID;
          results[i].LEND_DAY = lendingInfoContent.LEND_DAY;
        }
      }
    }
    // 整形して返す
    response = response.concat(FormatResults(results));
    res.send(response);
  }
}

// 貸出中の本のユーザーIDと貸出日を取得する補助関数
function GetLendingInfo(results, lendingInformation) {
  let isLending_array = [];
  // 貸出中の本のIDを配列に格納
  results.forEach((result) => {
    if (result.IS_LENDING == 1) {
      isLending_array.push(result.ID);
    }
  });
  // 貸出情報と突き合わせて一致するものを返す
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

// DBから取得した本情報をフロント用に整形する関数
function FormatResults(results) {
  // USER_IDが未定義の場合はnullにする
  if (results[0].USER_ID == undefined) results[0].USER_ID = null;

  // 必要な情報だけを抽出して返す
  return results.map((result) => ({
    book_id: result.ID,
    book_name: result.BOOK_NAME,
    book_auther: result.WRITTER,
    book_is_lending: result.IS_LENDING,
    lending_user_id: result.USER_ID,
    lend_date: result.LEND_DAY
  }));
}

// LENDING_BOOKテーブルから全貸出情報を取得する関数
async function GetLendingBooks(db) {
  try {
    // データベースから貸し出された本を取得
    const [results] = await db.query("SELECT * FROM LENDING_BOOK");
    return results;
  } catch (error) {
    // 失敗時処理
    db.end();
    console.error("エラー:", error);
    throw error;
  } finally {
    // データベースとの接続を切断
    db.end();
  }
}

module.exports = app;