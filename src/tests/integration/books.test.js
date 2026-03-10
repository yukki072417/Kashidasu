/**
 * 書籍API統合テスト
 */

const request = require("supertest");
const app = require("./testApp");
const { setupTestDatabase } = require("./setup");

// テスト前にデータベースをセットアップ
beforeAll(async () => {
  await setupTestDatabase();
});

// ログインヘルパー関数
async function loginAsAdmin(app) {
  const loginResponse = await request(app).post("/api/admin/login").send({
    admin_id: "admin",
    admin_password: "password123",
  });

  console.log("Login response status:", loginResponse.status);
  console.log("Login response body:", loginResponse.body);

  if (loginResponse.status !== 200) {
    throw new Error(
      `Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.body)}`,
    );
  }

  const setCookieHeader = loginResponse.headers["set-cookie"];
  return setCookieHeader ? setCookieHeader[0] : null;
}

describe("Books API Integration Tests", () => {
  let testBookIsbn = "9784167158057";
  let testBookData = {
    isbn: testBookIsbn,
    title: "統合テスト書籍",
    author: "統合テスト著者",
  };

  describe("POST /api/books", () => {
    test("新規書籍を作成できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 書籍作成
      const response = await request(app)
        .post("/api/books")
        .set("Cookie", sessionCookie)
        .send(testBookData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("書籍が正常に作成されました");
    });

    test("認証なしでは書籍を作成できない", async () => {
      const response = await request(app).post("/api/books").send(testBookData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/books/one", () => {
    test("書籍を取得できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 書籍取得
      const response = await request(app)
        .get(`/api/books/one?isbn=${testBookIsbn}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isbn).toBe(testBookIsbn);
      expect(response.body.data.title).toBe(testBookData.title);
    });

    test("存在しない書籍は取得できない", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 存在しない書籍を取得
      const response = await request(app)
        .get("/api/books/one?isbn=NONEXISTENT")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/books/all", () => {
    test("全書籍を取得できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 全書籍取得
      const response = await request(app)
        .get("/api/books/all")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/books", () => {
    test("書籍を更新できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      const updatedData = {
        isbn: testBookIsbn,
        title: "更新された書籍",
        author: "更新された著者",
      };

      // 書籍更新
      const response = await request(app)
        .put("/api/books")
        .set("Cookie", sessionCookie)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("書籍が正常に更新されました");

      // 更新確認
      const getResponse = await request(app)
        .get(`/api/books/one?isbn=${testBookIsbn}`)
        .set("Cookie", sessionCookie);

      expect(getResponse.body.data.title).toBe(updatedData.title);
      expect(getResponse.body.data.author).toBe(updatedData.author);
    });
  });

  describe("POST /api/books/search", () => {
    test("書籍を検索できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 書籍検索
      const response = await request(app)
        .post("/api/books/search")
        .set("Cookie", sessionCookie)
        .send({ query: "更新" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("DELETE /api/books", () => {
    test("書籍を削除できる", async () => {
      // 管理者ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 書籍削除
      const response = await request(app)
        .delete(`/api/books?isbn=${testBookIsbn}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("書籍が正常に削除されました");

      // 削除確認
      const getResponse = await request(app)
        .get(`/api/books/one?isbn=${testBookIsbn}`)
        .set("Cookie", sessionCookie);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.success).toBe(false);
    });
  });

  describe("認証フロー", () => {
    test("ログイン→操作→ログアウトの完全なフロー", async () => {
      // ログイン
      const sessionCookie = await loginAsAdmin(app);

      // 認証済みで操作
      const booksResponse = await request(app)
        .get("/api/books/all")
        .set("Cookie", sessionCookie);

      expect(booksResponse.status).toBe(200);
      expect(booksResponse.body.success).toBe(true);

      // ログアウト
      const logoutResponse = await request(app)
        .get("/api/admin/logout")
        .set("Cookie", sessionCookie);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // ログアウト後はアクセス不可
      const afterLogoutResponse = await request(app)
        .get("/api/books/all")
        .set("Cookie", sessionCookie);

      expect(afterLogoutResponse.status).toBe(401);
    });
  });
});
