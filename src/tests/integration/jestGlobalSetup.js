/**
 * Jest globalSetup — 統合テスト開始前に一度だけ実行される
 * Jest環境（jest.fn等）は使用不可。通常のNode.jsモジュールのみ使用可能。
 */

const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "../../..");
const REPOSITORY_PATH = path.join(ROOT, "repository");

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const full = path.join(dirPath, entry);
    if (fs.statSync(full).isDirectory()) {
      removeDir(full);
    } else {
      fs.unlinkSync(full);
    }
  }
  fs.rmdirSync(dirPath);
}

module.exports = async function () {
  process.env.NODE_ENV = "test";

  // リポジトリをクリーンな状態にリセット
  removeDir(REPOSITORY_PATH);

  // DB初期化（JSONファイル作成 + デフォルト管理者作成）
  const { initDb } = require(path.join(ROOT, "src/db/init"));
  await initDb();

  // テスト用管理者アカウントを作成
  const adminModel = require(path.join(ROOT, "src/model/adminModel"));
  const result = await adminModel.createAdmin("admin", "password123");
  if (!result.success) {
    throw new Error(`テスト用管理者の作成に失敗しました: ${result.message}`);
  }

  console.log("統合テスト用DBセットアップ完了");
};
