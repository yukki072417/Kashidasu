/**
 * APIルーターの単体テスト
 */

const request = require("supertest");
const express = require("express");

// モックの設定
jest.mock("../../../controller/cardController");
jest.mock("../../../services/auth");

const cardController = require("../../../controller/cardController");
const { apiAuth } = require("../../../services/auth");
const apiRoutes = require("../../../router/apiRoutes");

describe("API Routes Tests", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Expressアプリのセットアップ
    app = express();
    app.use(express.json());
    app.use("/api", apiRoutes);

    // apiAuthミドルウェアのモック
    apiAuth.mockImplementation((req, res, next) => {
      req.session = { admin: "testadmin" };
      next();
    });
  });

  describe("POST /api/card/generate", () => {
    test("カード生成エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: {
          cardId: "CARD123456",
          userId: "testuser",
          validUntil: "2026-12-31",
        },
        message: "カードが正常に生成されました",
      };

      cardController.generateCard.mockImplementation((req, res) => {
        res.status(201).json(mockResult);
      });

      const response = await request(app).post("/api/card/generate").send({
        user_id: "testuser",
        valid_days: 365,
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(cardController.generateCard).toHaveBeenCalled();
    });
  });

  describe("GET /api/card/status", () => {
    test("カード状態取得エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: {
          cardId: "CARD123456",
          userId: "testuser",
          status: "active",
          createdAt: "2026-03-10",
          validUntil: "2026-12-31",
        },
        message: "カード状態が正常に取得されました",
      };

      cardController.getCardStatus.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get(
        "/api/card/status?card_id=CARD123456",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(cardController.getCardStatus).toHaveBeenCalled();
    });
  });

  describe("認証ミドルウェア", () => {
    test("apiAuthミドルウェアが呼び出される", async () => {
      cardController.generateCard.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      await request(app)
        .post("/api/card/generate")
        .send({ user_id: "test", valid_days: 30 });

      expect(apiAuth).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    test("コントローラーエラー時の処理", async () => {
      cardController.getCardStatus.mockImplementation((req, res, next) => {
        const error = new Error("コントローラーエラー");
        next(error);
      });

      const response = await request(app).get(
        "/api/card/status?card_id=INVALID",
      );

      expect(response.status).toBe(500);
    });
  });
});
