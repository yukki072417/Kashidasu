const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config({path: "/usr/app/.env"});

// 公開鍵のパス
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

// ユーザー登録関数
async function registerUserModel(id, password, lastName, firstName) {
  const db = await connectDB();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedLastName = encryptRSA(lastName);
    const encryptedFirstName = encryptRSA(firstName);

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
    console.log("✅ ユーザー登録成功");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.error("⚠️ ユーザーIDは既に存在しています");
    } else {
      console.error("❌ ユーザー登録中にエラーが発生しました:", error.message);
    }
  } finally {
    await db.end();
  }
}

// テストユーザー登録の実行
(async () => {
  await registerUserModel("testuser01", "testpassword", "テスト姓", "テスト名");
})();
