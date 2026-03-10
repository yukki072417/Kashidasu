/**
 * カードAPI統合テスト
 */

const request = require("supertest");
const app = require("./testApp");

describe("Cards API Integration Tests", () => {
  let testUserId = "testuser123";
  let testUserData = {
    user_id: testUserId,
    user_password: "testpass123",
    user_name: "カードテストユーザー",
  };
  let generatedCardId = null;

  beforeAll(async () => {
    // テスト用ユーザーを作成
    const loginResponse = await request(app).post("/api/admin/login").send({
      admin_id: "admin",
      admin_password: "password123",
    });

    const sessionCookie = loginResponse.headers["set-cookie"];

    await request(app)
      .post("/api/users")
      .set("Cookie", sessionCookie)
      .send(testUserData);
  });

  afterAll(async () => {
    // テスト用ユーザーを削除
    const loginResponse = await request(app).post("/api/admin/login").send({
      admin_id: "admin",
      admin_password: "password123",
    });

    const sessionCookie = loginResponse.headers["set-cookie"];

    await request(app)
      .delete(`/api/users?user_id=${testUserId}`)
      .set("Cookie", sessionCookie);
  });

  describe("POST /api/card/generate", () => {
    test("認証済み管理者でカードを生成できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // カード生成
      const response = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: testUserId,
          valid_days: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("カードが正常に生成されました");
      expect(response.body.data.cardId).toBeDefined();
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.validUntil).toBeDefined();

      generatedCardId = response.body.data.cardId;
    });

    test("認証なしではカードを生成できない", async () => {
      const response = await request(app).post("/api/card/generate").send({
        user_id: testUserId,
        valid_days: 30,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("存在しないユーザーではカードを生成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 存在しないユーザーでカード生成
      const response = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: "NONEXISTENT",
          valid_days: 30,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("無効な有効期間ではカードを生成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 負の有効期間
      const response1 = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: testUserId,
          valid_days: -1,
        });

      expect(response1.status).toBe(400);
      expect(response1.body.success).toBe(false);

      // 過剰な有効期間
      const response2 = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: testUserId,
          valid_days: 1000,
        });

      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
    });
  });

  describe("GET /api/card/status", () => {
    test("カード状態を取得できる", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // カード状態取得
      const response = await request(app)
        .get(`/api/card/status?card_id=${generatedCardId}`)
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("カード状態が正常に取得されました");
      expect(response.body.data.cardId).toBe(generatedCardId);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.validUntil).toBeDefined();
    });

    test("認証なしではカード状態を取得できない", async () => {
      const response = await request(app).get(
        `/api/card/status?card_id=${generatedCardId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("存在しないカードの状態は取得できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 存在しないカード
      const response = await request(app)
        .get("/api/card/status?card_id=NONEXISTENT")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("カードライフサイクル", () => {
    test("カード生成→状態確認の完全なフロー", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // 新しいカード生成
      const generateResponse = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: testUserId,
          valid_days: 7,
        });

      expect(generateResponse.status).toBe(201);
      const newCardId = generateResponse.body.data.cardId;

      // カード状態確認
      const statusResponse = await request(app)
        .get(`/api/card/status?card_id=${newCardId}`)
        .set("Cookie", sessionCookie);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.cardId).toBe(newCardId);
      expect(statusResponse.body.data.status).toBe("active");
    });
  });

  describe("バリデーション", () => {
    test("必須項目が欠けている場合はカードを生成できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // user_id 欠如
      const response1 = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          valid_days: 30,
        });

      expect(response1.status).toBe(400);
      expect(response1.body.success).toBe(false);

      // valid_days 欠如
      const response2 = await request(app)
        .post("/api/card/generate")
        .set("Cookie", sessionCookie)
        .send({
          user_id: testUserId,
        });

      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
    });

    test("カードIDが指定されていない場合は状態を取得できない", async () => {
      // 管理者ログイン
      const loginResponse = await request(app).post("/api/admin/login").send({
        admin_id: "admin",
        admin_password: "password123",
      });

      const sessionCookie = loginResponse.headers["set-cookie"];

      // card_id 指定なし
      const response = await request(app)
        .get("/api/card/status")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("認可制御", () => {
    test("管理者のみがカード操作にアクセスできる", async () => {
      // 認証なしでのアクセス
      const operations = [
        {
          method: "post",
          path: "/api/card/generate",
          data: { user_id: "test", valid_days: 30 },
        },
        { method: "get", path: "/api/card/status?card_id=test" },
      ];

      for (const operation of operations) {
        let response;
        if (operation.method === "get") {
          response = await request(app).get(operation.path);
        } else if (operation.method === "post") {
          response = await request(app)
            .post(operation.path)
            .send(operation.data);
        }

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });
  });
});
