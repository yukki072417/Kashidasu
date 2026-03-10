/**
 * 統合テスト用セットアップ
 */

const initDb = require("../../db/init");
const adminModel = require("../../model/adminModel");

// テスト用データベースの初期化
async function setupTestDatabase() {
  try {
    // データベースを初期化
    await initDb.initDb();

    // 既存の管理者アカウントを削除
    try {
      const existingAdmin = await adminModel.getAdminByName("admin");
      if (existingAdmin.success) {
        // 既存アカウントを削除（もし可能なら）
        console.log("既存の管理者アカウントを確認しました");
      }
    } catch (error) {
      // アカウントが存在しない場合は続行
    }

    // テスト用管理者アカウントを作成
    const createResult = await adminModel.createAdmin("admin", "password123");
    if (createResult.success) {
      console.log("テスト用管理者アカウントを作成しました");
    } else {
      console.log(
        "管理者アカウントの作成に失敗しました:",
        createResult.message,
      );
    }
  } catch (error) {
    console.error("テストデータベースセットアップエラー:", error);
    throw error;
  }
}

module.exports = { setupTestDatabase };
