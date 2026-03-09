/**
 * operation.js
 *
 * JSONファイルの読み書きユーティリティ。
 * Transaction インスタンスを渡すことでトランザクション対応になる。
 *
 * トランザクションを使う場合:
 *   const tx = new Transaction();
 *   await tx.begin([filePath]);
 *   await writeJsonFile(dir, file, data); // 通常どおり書き込む
 *   await tx.commit() or tx.rollback();   // tx が復元を担当する
 *
 * → operation.js 自体はトランザクション管理に直接関与しない。
 *   ファイルパスさえ transaction.begin() に渡しておけばよい。
 */

const fs = require("fs").promises;
const path = require("path");

/**
 * JSONファイルを読み込む。
 * @param {string} filePath - ディレクトリパス
 * @param {string} fileName - ファイル名
 * @returns {Promise<any>} パースされたオブジェクト（存在しない場合は空配列）
 */
async function readJsonFile(filePath, fileName) {
  const fullPath = path.join(filePath, fileName);

  try {
    const data = await fs.readFile(fullPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error(`Error reading ${fileName}:`, error);
    throw error;
  }
}

/**
 * JSONファイルに書き込む。
 * @param {string} filePath - ディレクトリパス
 * @param {string} fileName - ファイル名
 * @param {any} data - 書き込むデータ
 */
async function writeJsonFile(filePath, fileName, data) {
  const fullPath = path.join(filePath, fileName);

  try {
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    throw error;
  }
}

/**
 * 指定ディレクトリ以下のJSONファイルの絶対パスを返す。
 * transaction.begin() に渡すファイルパスを組み立てる際に使う。
 *
 * @param {string} dirPath
 * @param {string} fileName
 * @returns {string}
 */
function resolveFilePath(dirPath, fileName) {
  return path.join(dirPath, fileName);
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  resolveFilePath,
};
