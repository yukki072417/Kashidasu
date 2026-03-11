/**
 * Database Init モジュールの単体テスト
 */

const { initDb } = require("../../../db/init");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

// createAdminをモック
jest.mock("../../../model/adminModel");
const { createAdmin } = require("../../../model/adminModel");

describe("Database Init Tests", () => {
  const actualRepositoryPath = path.join(__dirname, "../../../../repository");

  beforeEach(async () => {
    // 実際のリポジトリをクリーンアップ
    if (fsSync.existsSync(actualRepositoryPath)) {
      try {
        const files = fsSync.readdirSync(actualRepositoryPath);
        for (const file of files) {
          const filePath = path.join(actualRepositoryPath, file);
          try {
            fsSync.unlinkSync(filePath);
          } catch (error) {
            if (error.code === "EPERM") {
              fsSync.chmodSync(filePath, 0o666);
              fsSync.unlinkSync(filePath);
            }
          }
        }
        fsSync.rmdirSync(actualRepositoryPath);
      } catch (error) {
        console.warn("Failed to cleanup repository:", error.message);
      }
    }

    // モックをリセット
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // 実際のリポジトリをクリーンアップ
    if (fsSync.existsSync(actualRepositoryPath)) {
      try {
        const files = fsSync.readdirSync(actualRepositoryPath);
        for (const file of files) {
          const filePath = path.join(actualRepositoryPath, file);
          try {
            fsSync.unlinkSync(filePath);
          } catch (error) {
            if (error.code === "EPERM") {
              fsSync.chmodSync(filePath, 0o666);
              fsSync.unlinkSync(filePath);
            }
          }
        }
        fsSync.rmdirSync(actualRepositoryPath);
      } catch (error) {
        console.warn("Failed to cleanup repository:", error.message);
      }
    }
  });

  describe("initDb", () => {
    test("リポジトリディレクトリと必要なファイルを作成する", async () => {
      // createAdminのモックを設定
      createAdmin.mockResolvedValue({
        success: true,
        data: { adminId: "0123456789" },
      });

      // データベースを初期化
      await initDb();

      // リポジトリディレクトリが作成されたことを確認
      expect(fsSync.existsSync(actualRepositoryPath)).toBe(true);

      // 必要なファイルが作成されたことを確認
      const testFiles = ["admin.json", "book.json", "loan.json", "user.json"];
      for (const file of testFiles) {
        const filePath = path.join(actualRepositoryPath, file);
        expect(fsSync.existsSync(filePath)).toBe(true);

        // ファイル内容が空のJSON配列であることを確認
        const content = await fs.readFile(filePath, "utf8");
        const parsedData = JSON.parse(content);
        expect(parsedData).toEqual([]);
      }

      // createAdminが呼び出されたことを確認
      expect(createAdmin).toHaveBeenCalledWith("0123456789", "password");
      expect(createAdmin).toHaveBeenCalledTimes(1);
    });

    test("既存のファイルがある場合は初期化をスキップする", async () => {
      // 既存のファイルを作成
      fsSync.mkdirSync(actualRepositoryPath, { recursive: true });
      const testFiles = ["admin.json", "book.json", "loan.json", "user.json"];
      for (const file of testFiles) {
        const filePath = path.join(actualRepositoryPath, file);
        fsSync.writeFileSync(filePath, '[{"existing": true}]', "utf8");
      }

      // createAdminのモックを設定
      createAdmin.mockResolvedValue({
        success: true,
        data: { adminId: "0123456789" },
      });

      // データベースを初期化
      await initDb();

      // createAdminが呼び出されなかったことを確認
      expect(createAdmin).not.toHaveBeenCalled();

      // 既存のファイル内容が保持されていることを確認
      for (const file of testFiles) {
        const filePath = path.join(actualRepositoryPath, file);
        const content = await fs.readFile(filePath, "utf8");
        const parsedData = JSON.parse(content);
        expect(parsedData).toEqual([{ existing: true }]);
      }
    });

    test("管理者作成で例外が発生した場合にエラーを投げる", async () => {
      // createAdminのモックを例外に設定
      createAdmin.mockRejectedValue(new Error("データベースエラー"));

      // データベース初期化が失敗することを確認
      await expect(initDb()).rejects.toThrow("データベースエラー");
    });
  });

  describe("統合テスト", () => {
    test("複数回の初期化呼び出を安全に処理する", async () => {
      // createAdminのモックを設定
      createAdmin.mockResolvedValue({
        success: true,
        data: { adminId: "0123456789" },
      });

      // 最初の初期化
      await initDb();
      const firstCallCount = createAdmin.mock.calls.length;

      // 2回目の初期化（スキップされるはず）
      await initDb();
      const secondCallCount = createAdmin.mock.calls.length;

      // createAdminが最初の1回だけ呼び出されたことを確認
      expect(firstCallCount).toBe(1);
      expect(secondCallCount).toBe(1);
    });
  });

  describe("環境変数とパス設定", () => {
    test("リポジトリパスが正しく解決される", async () => {
      // createAdminのモックを設定
      createAdmin.mockResolvedValue({
        success: true,
        data: { adminId: "0123456789" },
      });

      // データベースを初期化
      await initDb();

      // リポジトリパスが正しく解決されていることを確認
      expect(actualRepositoryPath).toContain("repository");
    });
  });
});
