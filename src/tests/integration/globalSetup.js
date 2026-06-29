/**
 * 統合テスト用グローバルセットアップ（setupFilesAfterEnv）
 * DB初期化は jestGlobalSetup.js で一度だけ行われる
 */

const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

// テスト用の環境変数設定
process.env.NODE_ENV = "test";
process.env.REPOSITORY_PATH = path.join(ROOT, "src", "test-db");

// グローバルテストタイムアウトの設定
jest.setTimeout(10000);

// 未処理のPromiseやタイマーをクリーンアップするヘルパー
afterEach(() => {
  jest.clearAllMocks();
});
