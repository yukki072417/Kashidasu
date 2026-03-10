/**
 * 書籍ルーターの単体テスト
 */

const request = require("supertest");
const express = require("express");

// モックの設定
jest.mock("../../../controller/bookController");
jest.mock("../../../services/auth");

const bookController = require("../../../controller/bookController");
const { apiAuth } = require("../../../services/auth");
const bookRoutes = require("../../../router/bookRoutes");

describe("Book Routes Tests", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Expressアプリのセットアップ
    app = express();
    app.use(express.json());
    app.use("/books", bookRoutes);

    // apiAuthミドルウェアのモック
    apiAuth.mockImplementation((req, res, next) => {
      req.session = { admin: "testadmin" };
      next();
    });
  });

  describe("POST /books", () => {
    test("新規書籍作成エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "書籍が正常に作成されました",
      };

      bookController.createBook.mockImplementation((req, res) => {
        res.status(201).json(mockResult);
      });

      const response = await request(app).post("/books").send({
        isbn: "9784167158057",
        title: "テスト書籍",
        author: "テスト著者",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(bookController.createBook).toHaveBeenCalled();
    });
  });

  describe("GET /books/one", () => {
    test("書籍取得エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "書籍が正常に取得されました",
      };

      bookController.getBook.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get("/books/one?isbn=9784167158057");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(bookController.getBook).toHaveBeenCalled();
    });
  });

  describe("GET /books/all", () => {
    test("全書籍取得エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: [
          {
            isbn: "9784167158057",
            title: "テスト書籍1",
            author: "テスト著者1",
          },
          {
            isbn: "9784167158058",
            title: "テスト書籍2",
            author: "テスト著者2",
          },
        ],
        message: "全書籍が正常に取得されました",
      };

      bookController.getAllBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).get("/books/all");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(bookController.getAllBooks).toHaveBeenCalled();
    });
  });

  describe("PUT /books", () => {
    test("書籍更新エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "書籍が正常に更新されました",
      };

      bookController.updateBook.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).put("/books").send({
        isbn: "9784167158057",
        title: "更新された書籍",
        author: "更新された著者",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(bookController.updateBook).toHaveBeenCalled();
    });
  });

  describe("DELETE /books", () => {
    test("書籍削除エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: null,
        message: "書籍が正常に削除されました",
      };

      bookController.deleteBook.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app).delete("/books?isbn=9784167158057");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(bookController.deleteBook).toHaveBeenCalled();
    });
  });

  describe("POST /books/search", () => {
    test("書籍検索エンドポイント", async () => {
      const mockResult = {
        success: true,
        data: [
          {
            isbn: "9784167158057",
            title: "JavaScript入門",
            author: "山田太郎",
          },
        ],
        message: "書籍が正常に検索されました",
      };

      bookController.search.mockImplementation((req, res) => {
        res.status(200).json(mockResult);
      });

      const response = await request(app)
        .post("/books/search")
        .send({ query: "JavaScript" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(bookController.search).toHaveBeenCalled();
    });
  });

  describe("認証ミドルウェア", () => {
    test("apiAuthミドルウェアが呼び出される", async () => {
      bookController.createBook.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      await request(app)
        .post("/books")
        .send({ isbn: "9784167158057", title: "テスト", author: "テスト" });

      expect(apiAuth).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    test("コントローラーエラー時の処理", async () => {
      bookController.getBook.mockImplementation((req, res, next) => {
        const error = new Error("コントローラーエラー");
        next(error);
      });

      const response = await request(app).get("/books/one?isbn=9784167158057");

      expect(response.status).toBe(500);
    });
  });
});
