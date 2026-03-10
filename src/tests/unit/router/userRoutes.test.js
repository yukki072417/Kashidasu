/**
 * ユーザールーターの単体テスト
 */

const request = require("supertest");
const express = require("express");

// モックの設定
jest.mock("../../../controller/userController");
jest.mock("../../../services/auth");

const userController = require("../../../controller/userController");
const { apiAuth } = require("../../../services/auth");
const userRoutes = require("../../../router/userRoutes");

describe("User Routes Tests", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Expressアプリのセットアップ
    app = express();
    app.use(express.json());
    app.use("/users", userRoutes);

    // apiAuthミドルウェアのモック
    apiAuth.mockImplementation((req, res, next) => {
      req.session = { admin: "testadmin" };
      next();
    });
  });

  describe("POST /users", () => {
    test("ユーザー作成エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: { userId: "testuser123", userName: "テストユーザー" },
        message: "ユーザーが正常に作成されました",
      };

      userController.createUser.mockImplementation((req, res) => {
        res.status(201).json(mockResult);
      });

      const response = await request(app).post("/users").send({
        user_id: "testuser123",
        user_password: "testpass",
        user_name: "テストユーザー",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(userController.createUser).toHaveBeenCalled();
    });
  });

  describe("GET /users/one", () => {
    test("ユーザー取得エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: {
          userId: "testuser123",
          userName: "テストユーザー",
          createdAt: "2026-03-10",
        },
        message: "ユーザーが正常に取得されました",
      };

      userController.getUser.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get("/users/one?user_id=testuser123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(userController.getUser).toHaveBeenCalled();
    });
  });

  describe("PUT /users", () => {
    test("ユーザー更新エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      };

      userController.updateUser.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).put("/users").send({
        user_id: "testuser123",
        user_name: "更新されたユーザー",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(userController.updateUser).toHaveBeenCalled();
    });
  });

  describe("DELETE /users", () => {
    test("ユーザー削除エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      };

      userController.deleteUser.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).delete("/users?user_id=testuser123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(userController.deleteUser).toHaveBeenCalled();
    });
  });

  describe("認証ミドルウェア", () => {
    test("apiAuthミドルウェアが呼び出される", async () => {
      userController.createUser.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      await request(app)
        .post("/users")
        .send({ user_id: "test", user_password: "test", user_name: "テスト" });

      expect(apiAuth).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    test("コントローラーエラー時の処理", async () => {
      userController.getUser.mockImplementation((req, res, next) => {
        const error = new Error("コントローラーエラー");
        next(error);
      });

      const response = await request(app).get("/users/one?user_id=testuser");

      expect(response.status).toBe(500);
    });
  });
});
