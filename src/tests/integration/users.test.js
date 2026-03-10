/**
 * ユーザーAPI統合テスト
 */

const request = require("supertest");
const app = require("./testApp");

describe("Users API Integration Tests", () => {
  let testUserId = "testuser123";
  let testUserData = {
    user_id: testUserId,
    user_password: "testpass123",
    user_name: "テストユーザー",
  };

  describe("POST /api/users", () => {
    test("認証済み管理者で新規ユーザーを作成できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 新規ユーザー作成
      const response = await request(app)
        .post("/api/users")
        .set("Cookie", sessionCookie)
        .send(testUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ユーザーが正常に作成されました");
    });

    test("認証なしではユーザーを作成できない", async () => {
      const response = await request(app).post("/api/users").send(testUserData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("重複するユーザーIDでは作成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 重複ユーザー作成
      const response = await request(app)
        .post("/api/users")
        .set("Cookie", sessionCookie)
        .send(testUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users/one", () => {
    test("ユーザー情報を取得できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // ユーザー情報取得
      const response = await request(app)
        .get(`/api/users/one?user_id=${testUserId}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.userName).toBe(testUserData.user_name);
    });

    test("存在しないユーザーは取得できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 存在しないユーザーを取得
      const response = await request(app)
        .get("/api/users/one?user_id=NONEXISTENT")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/users", () => {
    test("ユーザー情報を更新できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      const updatedData = {
        user_id: testUserId,
        user_name: "更新されたユーザー",
      };

      // ユーザー情報更新
      const response = await request(app)
        .put("/api/users")
        .set("Cookie", sessionCookie)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ユーザーが正常に更新されました");

      // 更新確認
      const getResponse = await request(app)
        .get(`/api/users/one?user_id=${testUserId}`)
        .set("Cookie", sessionCookie);

      expect(getResponse.body.data.userName).toBe(updatedData.user_name);
    });
  });

  describe("DELETE /api/users", () => {
    test("ユーザーを削除できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // ユーザー削除
      const response = await request(app)
        .delete(`/api/users?user_id=${testUserId}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ユーザーが正常に削除されました");

      // 削除確認
      const getResponse = await request(app)
        .get(`/api/users/one?user_id=${testUserId}`)
        .set("Cookie", sessionCookie);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.success).toBe(false);
    });
  });

  describe("バリデーション", () => {
    test("必須項目が欠けている場合はユーザーを作成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // user_id 欠如
      const response1 = await request(app)
        .post("/api/users")
        .set("Cookie", sessionCookie)
        .send({
          user_password: "testpass",
          user_name: "テスト",
        });

      expect(response1.status).toBe(400);
      expect(response1.body.success).toBe(false);

      // user_password 欠如
      const response2 = await request(app)
        .post("/api/users")
        .set("Cookie", sessionCookie)
        .send({
          user_id: "test",
          user_name: "テスト",
        });

      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);

      // user_name 欠如
      const response3 = await request(app)
        .post("/api/users")
        .set("Cookie", sessionCookie)
        .send({
          user_id: "test",
          user_password: "testpass",
        });

      expect(response3.status).toBe(400);
      expect(response3.body.success).toBe(false);
    });
  });

  describe("認可制御", () => {
    test("管理者のみがユーザー操作にアクセスできる", async () => {
      // 認証なしでのアクセス
      const operations = [
        { method: "get", path: "/api/users/one?user_id=test" },
        {
          method: "post",
          path: "/api/users",
          data: { user_id: "test", user_password: "test", user_name: "test" },
        },
        {
          method: "put",
          path: "/api/users",
          data: { user_id: "test", user_name: "test" },
        },
        { method: "delete", path: "/api/users?user_id=test" },
      ];

      for (const operation of operations) {
        let response;
        if (operation.method === "get") {
          response = await request(app).get(operation.path);
        } else if (operation.method === "post") {
          response = await request(app)
            .post(operation.path)
            .send(operation.data);
        } else if (operation.method === "put") {
          response = await request(app)
            .put(operation.path)
            .send(operation.data);
        } else if (operation.method === "delete") {
          response = await request(app).delete(operation.path);
        }

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });
  });
});
