/**
 * デバッグ用統合テスト
 */

const request = require("supertest");
const app = require("./testApp");
const { setupTestDatabase } = require("./setup");

describe("Debug Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  test("管理者ログインが成功すること", async () => {
    const loginResponse = await request(app).post("/api/admin/login").send({
      admin_id: "admin",
      admin_password: "password123",
    });

    console.log("Login response status:", loginResponse.status);
    console.log("Login response body:", loginResponse.body);
    console.log("Login response headers:", loginResponse.headers);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });
});
