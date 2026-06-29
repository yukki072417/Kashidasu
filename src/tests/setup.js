// Jestテストセットアップファイル

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.resolve(__dirname, "..");

// テスト用の環境変数設定
process.env.NODE_ENV = "test";
process.env.REPOSITORY_PATH = path.join(SRC, "test-db");

// グローバルテストタイムアウトの設定
jest.setTimeout(10000);


// テスト用ディレクトリのクリーンアップ関数
function cleanupTestDirectories() {
  const testDirs = [
    path.join(SRC, "test-pdf"),
    path.join(SRC, "test-db"),
    path.join(ROOT, "test-results"),
    path.join(ROOT, "coverage"),
  ];

  testDirs.forEach((dir) => {
    try {
      if (fs.existsSync(dir)) {
        // ディレクトリ内のファイルを再帰的に削除
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              // サブディレクトリを再帰的に削除
              cleanupDirectory(filePath);
            } else {
              // ファイルを削除
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            // 削除に失敗しても続行
            console.warn(`Failed to delete ${filePath}:`, error.message);
          }
        }
      }
    } catch (error) {
      // ディレクトリが存在しない場合は無視
    }
  });
}

// ディレクトリを再帰的に削除する関数
function cleanupDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        cleanupDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
    fs.rmdirSync(dirPath);
  } catch (error) {
    console.warn(`Failed to cleanup directory ${dirPath}:`, error.message);
  }
}

// 未処理のPromiseやタイマーをクリーンアップするヘルパー
afterEach(() => {
  jest.clearAllMocks();
});

// テスト開始前のセットアップ
beforeAll(() => {
  // テスト用ディレクトリをクリーンアップ
  cleanupTestDirectories();

  // テスト用ディレクトリを作成
  const testDirs = [
    path.join(SRC, "test-db"),
    path.join(SRC, "test-pdf"),
    path.join(ROOT, "test-results"),
  ];
  testDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

// テスト終了時のクリーンアップ
afterAll(() => {
  // タイムアウトをクリア
  clearTimeout();
  clearInterval();

  // テスト用ディレクトリをクリーンアップ（オプション）
  // cleanupTestDirectories();
});
