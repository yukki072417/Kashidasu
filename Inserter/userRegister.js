const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const CERTS_DIR = '/usr/app/certs/encryption.key'; // コンテナ内のパス

// 暗号化キーを読み込む
let ENCRYPTION_KEY;
try {
    ENCRYPTION_KEY = fs.readFileSync(CERTS_DIR, 'utf8').trim();
    if (ENCRYPTION_KEY.length !== 32) {
        throw new Error('暗号化キーの長さが32文字ではありません。');
    }
} catch (error) {
    console.error('暗号化キーの読み込み中にエラーが発生しました:', error.message);
    process.exit(1);
}

const IV_LENGTH = 16; // 初期化ベクトルの長さ

// 暗号化関数
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// データベース接続
async function connect() {
    return mysql.createConnection({
        host: "db",
        user: process.env.DB_USER,
        password: process.env.ROOT_PASSWORD,
        database: "KASHIDASU",
    });
}

// ユーザー登録関数
async function registerUser(id, password, lastName, firstName) {
    const db = await connect();

    try {
        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // 名前を暗号化
        const encryptedLastName = encrypt(lastName);
        const encryptedFirstName = encrypt(firstName);

        // データベースに挿入
        const query = `
            INSERT INTO ADMIN_USER (ID, PASSWORD, LAST_NAME, FIRST_NAME)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(query, [id, hashedPassword, encryptedLastName, encryptedFirstName]);

        console.log('ユーザー登録が完了しました。');
    } catch (error) {
        console.error('ユーザー登録中にエラーが発生しました:', error);
    } finally {
        await db.end();
    }
}

// サンプルデータで登録
(async () => {
    await registerUser('1234567892', 'securepassword', '山田', '太郎');
})();