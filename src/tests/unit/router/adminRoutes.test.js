/**
 * 管理者ルーターの単体テスト
 */

const request = require("supertest");
const express = require("express");

// モックの設定
jest.mock("../../../controller/adminController");
jest.mock("../../../services/auth");

const adminController = require("../../../controller/adminController");
const { apiAuth, login, logout } = require("../../../services/auth");
const adminRoutes = require("../../../router/adminRoutes");

describe("Admin Routes Tests", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Expressアプリのセットアップ
    app = express();
    app.use(express.json());
    app.use("/admin", adminRoutes);

    // apiAuthミドルウェアのモック
    apiAuth.mockImplementation((req, res, next) => {
      req.session = { admin: "testadmin" };
      next();
    });
  });

  describe("POST /admin/login", () => {
    test("ログインエンドポイント", async () => {
      const mockResult = {
        success: true,
        data: { adminId: "testadmin" },
        message: "ログインに成功しました",
      };

      login.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).post("/admin/login").send({
        admin_id: "testadmin",
        admin_password: "testpass",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(login).toHaveBeenCalled();
    });
  });

  describe("GET /admin/logout", () => {
    test("ログアウトエンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "ログアウトしました",
      };

      logout.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get("/admin/logout");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(logout).toHaveBeenCalled();
    });
  });

  describe("POST /admin", () => {
    test("管理者作成エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: { adminId: "newadmin" },
        message: "管理者が正常に作成されました",
      };

      adminController.createAdmin.mockImplementation((req, res) => {
        res.status(201).json(mockResult);
      });

      const response = await request(app).post("/admin").send({
        admin_id: "newadmin",
        admin_password: "newpass",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(adminController.createAdmin).toHaveBeenCalled();
    });
  });

  describe("GET /admin/one", () => {
    test("管理者取得エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: { adminId: "testadmin", createdAt: "2026-03-10" },
        message: "管理者が正常に取得されました",
      };

      adminController.getAdmin.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get("/admin/one?admin_id=testadmin");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(adminController.getAdmin).toHaveBeenCalled();
    });
  });

  describe("PUT /admin", () => {
    test("管理者更新エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      };

      adminController.updateAdmin.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).put("/admin").send({
        admin_id: "testadmin",
        admin_password: "newpass",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(adminController.updateAdmin).toHaveBeenCalled();
    });
  });

  describe("DELETE /admin", () => {
    test("管理者削除エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      };

      adminController.deleteAdmin.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).delete("/admin?admin_id=testadmin");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(adminController.deleteAdmin).toHaveBeenCalled();
    });
  });

  describe("認証ミドルウェア", () => {
    test("認証不要エンドポイントではapiAuthが呼び出されない", async () => {
      login.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      await request(app)
        .post("/admin/login")
        .send({ admin_id: "test", admin_password: "test" });

      expect(apiAuth).not.toHaveBeenCalled();
      expect(login).toHaveBeenCalled();
    });

    test("認証必要エンドポイントではapiAuthが呼び出される", async () => {
      adminController.createAdmin.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      await request(app)
        .post("/admin")
        .send({ admin_id: "test", admin_password: "test" });

      expect(apiAuth).toHaveBeenCalled();
      expect(adminController.createAdmin).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    test("コントローラーエラー時の処理", async () => {
      adminController.getAdmin.mockImplementation((req, res, next) => {
        const error = new Error("コントローラーエラー");
        next(error);
      });

      const response = await request(app).get("/admin/one?admin_id=testadmin");

      expect(response.status).toBe(500);
    });
  });
});
