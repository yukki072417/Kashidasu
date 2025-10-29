const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const { Console } = require("console");
require("dotenv").config();

// RSA公開鍵のパス
const PUBLIC_KEY_PATH = "/usr/app/certs/rsa_public.pem";

// 公開鍵を取得する関数
function getPublicKey() {
  try {
    return fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
  } catch (error) {
    console.error("公開鍵の読み込み中にエラーが発生しました:", error.message);
    process.exit(1);
  }
}

// RSA暗号化関数
function encryptRSA(text) {
  const publicKey = getPublicKey();
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    },
    Buffer.from(text)
  ).toString('base64');
}

// データベース接続関数
async function connectDB() {
  return mysql.createConnection({
    host: "db",
    user: "root",
    password: process.env.ROOT_PASSWORD,
    database: "KASHIDASU",
  });
}

//初期設定アカウントを追加
async function RegisterInitUser() {
  const db = await connectDB();
  const [isInitUserExist, fields] = await db.query(
    "SELECT * FROM ADMIN_USER WHERE ID = '3236541029'"
  );
  //await registerUserModel('3236541033', 'PASSWORD', '初期設定', 'アカウント'); 
  // await registerUserModel('3236541032', 'PASSWORD', '初期設定', 'アカウント'); 
  await registerUserModel('3236541029', 'PASSWORD', '初期設定', 'アカウント'); 
  if(isInitUserExist.length == 0){
    //await registerUserModel('1234567890', 'PASSWORD', '初期設定', 'アカウント'); 
    console.log('初期設定アカウント登録')
  }
}

// ユーザー登録のモデル関数
async function registerUserModel(id, password, lastName, firstName) {
  const db = await connectDB();

  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 名前をRSA暗号化
    const encryptedLastName = encryptRSA(lastName);
    const encryptedFirstName = encryptRSA(firstName);

    // データベースに挿入
    const query = `
      INSERT INTO ADMIN_USER (ID, PASSWORD, LAST_NAME, FIRST_NAME)
      VALUES (?, ?, ?, ?)
    `;


    await db.execute(query, [
      id,
      hashedPassword,
      encryptedLastName,
      encryptedFirstName,
    ]);

    return { result: "SUCCESS" };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return { result: "FAILED", message: "USER_ALREADY_EXISTS" };
    }
    console.error("ユーザー登録中にエラーが発生しました:", error);
    return { result: "FAILED", message: error.message };
  } finally {
    await db.end();
  }
}

// エクスポートするAPI関数
async function RegisterUser(req, res) {
  const data = req.body;
  const result = await registerUserModel(
    data.id,
    data.password,
    data.last_name,
    data.first_name
  );
  res.send(result);
}

module.exports = { RegisterUser, RegisterInitUser };