/**
 * フロントエンドテスト用セットアップ
 */

// jQueryグローバル設定
global.$ = global.jQuery = require("jquery");

// DOM APIのモック（JSDOMが提供）
global.HTMLElement = window.HTMLElement;
global.HTMLDocument = window.HTMLDocument;

// fetch APIモック
global.fetch = jest.fn();

// alertモック
global.alert = jest.fn();

// consoleメソッドをモック（テスト出力の整理）
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
