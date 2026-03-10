/**
 * 管理者API統合テスト
 */

const request = require("supertest");
const app = require("./testApp");

// ログインヘルパー関数
async function loginAsAdmin(app) {
  const loginResponse = await request(app).post("/api/admin/login").send({
    admin_id: "admin",
    admin_password: "password123",
  });

  if (loginResponse.status !== 200) {
    throw new Error("Login failed");
  }

  const setCookieHeader = loginResponse.headers["set-cookie"];
  return setCookieHeader ? setCookieHeader[0] : null;
}

describe("Admin API Integration Tests", () => {
  let testAdminId = "testadmin123";
  let testAdminData = {
    admin_id: testAdminId,
    admin_password: "testpass123",
  };

  describe("POST /api/admin/login", () => {
    test("有効な認証情報でログインできる", async () => {
      const response = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ログインに成功しました");
      expect(response.body.data.adminId).toBe("admin");
      expect(response.headers["set-cookie"]).toBeDefined();
      const sessionCookie = response.headers["set-cookie"][0];
    });

    test("無効な認証情報ではログインできない", async () => {
      const response = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("IDまたはパスワードが間違っています");
    });

    test("必須項目が欠けている場合はログインできない", async () => {
      const response = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        // admin_password 欠如
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("IDとパスワードは必須です");
    });
  });

  describe("GET /api/admin/logout", () => {
    test("ログアウトできる", async () => {
      // まずログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // ログアウト
      const response = await request(app)
        .get("/api/admin/logout")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ログアウトしました");
    });
  });

  describe("POST /api/admin", () => {
    test("認証済み管理者で新規管理者を作成できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 新規管理者作成
      const response = await request(app)
        .post("/api/admin")
        .set("Cookie", sessionCookie)
        .send(testAdminData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("管理者が正常に作成されました");
    });

    test("認証なしでは管理者を作成できない", async () => {
      const response = await request(app)
        .post("/api/admin")
        .send(testAdminData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("重複する管理者IDでは作成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 重複管理者作成
      const response = await request(app)
        .post("/api/admin")
        .set("Cookie", sessionCookie)
        .send({
          admin_id: "admin", // 既存のID
          admin_password: "newpass",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/admin/one", () => {
    test("管理者情報を取得できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 管理者情報取得
      const response = await request(app)
        .get(`/api/admin/one?admin_id=${testAdminId}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.adminId).toBe(testAdminId);
    });

    test("存在しない管理者は取得できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 存在しない管理者を取得
      const response = await request(app)
        .get("/api/admin/one?admin_id=NONEXISTENT")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/admin", () => {
    test("管理者情報を更新できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      const updatedData = {
        admin_id: testAdminId,
        admin_password: "updatedpass123",
      };

      // 管理者情報更新
      const response = await request(app)
        .put("/api/admin")
        .set("Cookie", sessionCookie)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("管理者が正常に更新されました");
    });
  });

  describe("DELETE /api/admin", () => {
    test("管理者を削除できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // テスト管理者削除
      const response = await request(app)
        .delete(`/api/admin?admin_id=${testAdminId}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("管理者が正常に削除されました");

      // 削除確認
      const getResponse = await request(app)
        .get(`/api/admin/one?admin_id=${testAdminId}`)
        .set("Cookie", sessionCookie);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.success).toBe(false);
    });

    test("自分自身を削除できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 自分自身を削除しようとする
      const response = await request(app)
        .delete("/api/admin?admin_id=admin")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("セッション管理", () => {
    test("セッションが有効な間のみアクセスできる", async () => {
      // ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // セッション有効時のアクセス
      const validResponse = await request(app)
        .get("/api/admin/one?admin_id=admin")
        .set("Cookie", sessionCookie);

      expect(validResponse.status).toBe(200);

      // ログアウト
      await request(app).get("/api/admin/logout").set("Cookie", sessionCookie);

      // セッション無効時のアクセス
      const invalidResponse = await request(app)
        .get("/api/admin/one?admin_id=admin")
        .set("Cookie", sessionCookie);

      expect(invalidResponse.status).toBe(401);
    });
  });
});
