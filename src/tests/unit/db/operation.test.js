/**
 * Database Operation モジュールの単体テスト
 */

const { readJsonFile, writeJsonFile, resolveFilePath } = require("../../../db/operation");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

describe("Database Operation Tests", () => {
  const testDir = "./src/test-db/operations";
  const testFile = "test.json";

  beforeEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    if (fsSync.existsSync(testDir)) {
      const files = await fs.readdir(testDir);
      await Promise.all(files.map(file => fs.unlink(path.join(testDir, file))));
    } else {
      await fs.mkdir(testDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    if (fsSync.existsSync(testDir)) {
      const files = await fs.readdir(testDir);
      await Promise.all(files.map(file => fs.unlink(path.join(testDir, file))));
      await fs.rmdir(testDir);
    }
  });

  describe("readJsonFile", () => {
    test("存在するJSONファイルを読み込める", async () => {
      const testData = [{ id: 1, name: "test" }];
      const filePath = path.join(testDir, testFile);
      
      // テストデータを書き込む
      await fs.writeFile(filePath, JSON.stringify(testData, null, 2), "utf8");
      
      // ファイルを読み込む
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toEqual(testData);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe("test");
    });

    test("存在しないファイルの場合に空配列を返す", async () => {
      const result = await readJsonFile(testDir, "nonexistent.json");
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test("無効なJSONファイルの場合にエラーを投げる", async () => {
      const filePath = path.join(testDir, testFile);
      
      // 無効なJSONを書き込む
      await fs.writeFile(filePath, "{ invalid json }", "utf8");
      
      await expect(readJsonFile(testDir, testFile)).rejects.toThrow();
    });

    test("空のJSONファイルを読み込める", async () => {
      const filePath = path.join(testDir, testFile);
      
      // 空のJSON配列を書き込む
      await fs.writeFile(filePath, "[]", "utf8");
      
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test("複雑なJSON構造を読み込める", async () => {
      const complexData = {
        users: [
          { id: 1, name: "user1", settings: { theme: "dark", lang: "ja" } },
          { id: 2, name: "user2", settings: { theme: "light", lang: "en" } }
        ],
        metadata: {
          version: "1.0.0",
          createdAt: "2026-03-10T12:00:00Z"
        }
      };
      
      const filePath = path.join(testDir, testFile);
      await fs.writeFile(filePath, JSON.stringify(complexData, null, 2), "utf8");
      
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toEqual(complexData);
      expect(result.users).toHaveLength(2);
      expect(result.users[0].settings.theme).toBe("dark");
      expect(result.metadata.version).toBe("1.0.0");
    });
  });

  describe("writeJsonFile", () => {
    test("JSONファイルに書き込める", async () => {
      const testData = [{ id: 1, name: "test" }];
      
      await writeJsonFile(testDir, testFile, testData);
      
      // ファイルが存在することを確認
      const filePath = path.join(testDir, testFile);
      expect(fsSync.existsSync(filePath)).toBe(true);
      
      // ファイル内容を確認
      const content = await fs.readFile(filePath, "utf8");
      const parsedData = JSON.parse(content);
      
      expect(parsedData).toEqual(testData);
    });

    test("空配列を書き込める", async () => {
      await writeJsonFile(testDir, testFile, []);
      
      const filePath = path.join(testDir, testFile);
      const content = await fs.readFile(filePath, "utf8");
      const parsedData = JSON.parse(content);
      
      expect(parsedData).toEqual([]);
      expect(Array.isArray(parsedData)).toBe(true);
    });

    test("複雑なオブジェクトを書き込める", async () => {
      const complexData = {
        nested: {
          level1: {
            level2: {
              value: "deep"
            }
          }
        },
        array: [1, 2, 3, { nested: "array" }],
        nullValue: null,
        booleanValue: true
      };
      
      await writeJsonFile(testDir, testFile, complexData);
      
      const filePath = path.join(testDir, testFile);
      const content = await fs.readFile(filePath, "utf8");
      const parsedData = JSON.parse(content);
      
      expect(parsedData).toEqual(complexData);
      expect(parsedData.nested.level1.level2.value).toBe("deep");
      expect(parsedData.array[3].nested).toBe("array");
      expect(parsedData.nullValue).toBeNull();
      expect(parsedData.booleanValue).toBe(true);
    });

    test("既存ファイルを上書きできる", async () => {
      const originalData = [{ id: 1, name: "original" }];
      const newData = [{ id: 2, name: "updated" }];
      
      // 最初のデータを書き込む
      await writeJsonFile(testDir, testFile, originalData);
      
      // 新しいデータで上書き
      await writeJsonFile(testDir, testFile, newData);
      
      // 上書きされたことを確認
      const filePath = path.join(testDir, testFile);
      const content = await fs.readFile(filePath, "utf8");
      const parsedData = JSON.parse(content);
      
      expect(parsedData).toEqual(newData);
      expect(parsedData).not.toEqual(originalData);
    });

    test("インデントが正しく適用される", async () => {
      const testData = [{ id: 1, name: "test" }];
      
      await writeJsonFile(testDir, testFile, testData);
      
      const filePath = path.join(testDir, testFile);
      const content = await fs.readFile(filePath, "utf8");
      
      // イデントが2スペースであることを確認
      expect(content).toContain("  \"id\": 1,");
      expect(content).toContain("  \"name\": \"test\"");
    });
  });

  describe("resolveFilePath", () => {
    test("ファイルパスを正しく解決する", () => {
      const dirPath = "/test/directory";
      const fileName = "file.json";
      
      const result = resolveFilePath(dirPath, fileName);
      
      expect(result).toBe(path.join(dirPath, fileName));
      expect(result).toMatch(/\/test\/directory\/file\.json$/);
    });

    test("Windowsパスも正しく処理する", () => {
      const dirPath = "C:\\test\\directory";
      const fileName = "file.json";
      
      const result = resolveFilePath(dirPath, fileName);
      
      expect(result).toContain("file.json");
      expect(typeof result).toBe("string");
    });

    test("相対パスを正しく処理する", () => {
      const dirPath = "./relative/path";
      const fileName = "test.json";
      
      const result = resolveFilePath(dirPath, fileName);
      
      expect(result).toContain("relative/path");
      expect(result).toContain("test.json");
    });

    test("ネストされたディレクトリを正しく処理する", () => {
      const dirPath = "/deep/nested/directory/structure";
      const fileName = "data.json";
      
      const result = resolveFilePath(dirPath, fileName);
      
      expect(result).toContain("deep/nested/directory/structure");
      expect(result).toContain("data.json");
    });
  });

  describe("統合テスト", () => {
    test("書き込みと読み込みの連携が正しく動作する", async () => {
      const testData = [
        { id: 1, name: "user1", active: true },
        { id: 2, name: "user2", active: false },
        { id: 3, name: "user3", active: true }
      ];
      
      // 書き込み
      await writeJsonFile(testDir, testFile, testData);
      
      // 読み込み
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toEqual(testData);
      expect(result).toHaveLength(3);
      expect(result[0].active).toBe(true);
      expect(result[1].active).toBe(false);
    });

    test("大規模データの読み書きが正しく動作する", async () => {
      // 1000件のテストデータを生成
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        metadata: {
          createdAt: new Date().toISOString(),
          version: "1.0.0"
        }
      }));
      
      // 書き込み
      await writeJsonFile(testDir, testFile, largeData);
      
      // 読み込み
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toHaveLength(1000);
      expect(result[0].id).toBe(1);
      expect(result[999].id).toBe(1000);
      expect(result[500].name).toBe("user501");
    });

    test("特殊文字を含むデータの読み書きが正しく動作する", async () => {
      const specialData = [
        { 
          id: 1, 
          name: "テストユーザー", 
          description: "日本語の説明文です",
          emoji: "🎉🚀",
          specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?"
        },
        {
          id: 2,
          name: "User with quotes",
          description: "This contains 'single' and \"double\" quotes",
          newline: "Line 1\nLine 2\nLine 3",
          tab: "Column1\tColumn2\tColumn3"
        }
      ];
      
      // 書き込み
      await writeJsonFile(testDir, testFile, specialData);
      
      // 読み込み
      const result = await readJsonFile(testDir, testFile);
      
      expect(result).toEqual(specialData);
      expect(result[0].name).toBe("テストユーザー");
      expect(result[0].emoji).toBe("🎉🚀");
      expect(result[1].description).toContain('single');
      expect(result[1].description).toContain('double');
    });
  });

  describe("エラーハンドリング", () => {
    test("読み込み時のパーミッションエラーを適切に処理する", async () => {
      // このテストは環境によって実行できない場合があるため、スキップする可能性がある
      const filePath = path.join(testDir, testFile);
      
      // ファイルを作成
      await fs.writeFile(filePath, "[]", "utf8");
      
      try {
        // ファイルを読み取り専用に設定（Unix系システムのみ）
        await fs.chmod(filePath, 0o444);
        
        // 書き込みを試みる（読み取りは可能）
        const result = await readJsonFile(testDir, testFile);
        expect(result).toEqual([]);
        
        // パーミッションを元に戻す
        await fs.chmod(filePath, 0o644);
      } catch (error) {
        // Windowsや権限のない環境ではスキップ
        console.log("Permission test skipped:", error.message);
      }
    });

    test("書き込み時のディレクトリ不存在エラーを適切に処理する", async () => {
      const nonExistentDir = path.join(testDir, "nonexistent");
      const testData = [{ id: 1, name: "test" }];
      
      await expect(
        writeJsonFile(nonExistentDir, testFile, testData)
      ).rejects.toThrow();
    });
  });
});
