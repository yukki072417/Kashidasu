// Jestテストセットアップファイル

// テスト用の環境変数設定
process.env.NODE_ENV = 'test';
process.env.REPOSITORY_PATH = './src/test-db';

// グローバルテストタイムアウトの設定
jest.setTimeout(10000);

// 未処理のPromiseやタイマーをクリーンアップするヘルパー
afterEach(() => {
  jest.clearAllMocks();
});

// テスト終了時のクリーンアップ
afterAll(() => {
  // タイムアウトをクリア
  clearTimeout();
  clearInterval();
});
