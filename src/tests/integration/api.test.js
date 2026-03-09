const request = require("supertest");
const path = require("path");
const fs = require("fs").promises;

// テスト用のデータベースパスを設定
const testDbPath = path.join(__dirname, "../../test-db");
process.env.REPOSITORY_PATH = testDbPath;

// アプリケーションのインポート
const app = require("../../app");

describe("Backend Integration Tests", () => {
  let server;

  beforeAll(async () => {
    // テスト用データベースディレクトリの作成
    try {
      await fs.mkdir(testDbPath, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // テスト用の空のJSONファイルを作成
    const emptyFiles = ["admin.json", "user.json", "book.json", "loans.json"];
    for (const file of emptyFiles) {
      const filePath = path.join(testDbPath, file);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, "[]");
      }
    }

    // サーバー起動
    server = app.listen(0); // ランダムなポートで起動
  });

  afterAll(async () => {
    // サーバー停止
    if (server) {
      server.close();
    }

    // テスト用データベースのクリーンアップ
    try {
      const files = await fs.readdir(testDbPath);
      for (const file of files) {
        await fs.unlink(path.join(testDbPath, file));
      }
      await fs.rmdir(testDbPath);
    } catch (error) {
      console.log("Cleanup error:", error);
    }
  });

  describe("Admin API Integration", () => {
    let adminToken;
    const testAdmin = {
      adminId: "testadmin123",
      password: "testpass123",
    };

    test("POST /api/admin/register - 新規管理者登録", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send(testAdmin)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admin.adminId).toBe(testAdmin.adminId);
    });

    test("POST /api/admin/login - 正常なログイン", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send(testAdmin)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("ログインに成功しました");
    });

    test("POST /api/admin/login - 不正なパスワード", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          adminId: testAdmin.adminId,
          password: "wrongpass",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("パスワードが違います");
    });

    test("GET /api/admin/get - 管理者情報取得", async () => {
      const response = await request(app)
        .get("/api/admin/get")
        .query({ adminId: testAdmin.adminId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admin.adminId).toBe(testAdmin.adminId);
    });
  });

  describe("User API Integration", () => {
    const testUser = {
      userId: "testuser123",
      password: "userpass123",
    };

    test("POST /api/user/register - 新規ユーザー登録", async () => {
      const response = await request(app)
        .post("/api/user/register")
        .send(testUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(testUser.userId);
    });

    test("GET /api/user/get - ユーザー情報取得", async () => {
      const response = await request(app)
        .get("/api/user/get")
        .query({ userId: testUser.userId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(testUser.userId);
    });

    test("PUT /api/user/update - ユーザー情報更新", async () => {
      const updateData = {
        userId: testUser.userId,
        changedUserId: "updateduser123",
        changedPassword: "newpass123",
      };

      const response = await request(app)
        .put("/api/user/update")
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.affectedRows).toBe(1);
    });
  });

  describe("Book API Integration", () => {
    const testBook = {
      isbn: "9784167158057",
      title: "テスト書籍",
      author: "テスト著者",
      publisher: "テスト出版社",
    };

    test("POST /api/book/register - 新規書籍登録", async () => {
      const response = await request(app)
        .post("/api/book/register")
        .send(testBook)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.book.isbn).toBe(testBook.isbn);
    });

    test("GET /api/book/get - 書籍情報取得", async () => {
      const response = await request(app)
        .get("/api/book/get")
        .query({ isbn: testBook.isbn })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.book.isbn).toBe(testBook.isbn);
    });

    test("PUT /api/book/update - 書籍情報更新", async () => {
      const updateData = {
        isbn: testBook.isbn,
        changedIsbn: "9784167158058",
        changedTitle: "更新書籍",
        changedAuthor: "更新著者",
        changedPublisher: "更新出版社",
      };

      const response = await request(app)
        .put("/api/book/update")
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.affectedRows).toBe(1);
    });

    test("GET /api/book/search - 書籍検索", async () => {
      const response = await request(app)
        .get("/api/book/search")
        .query({ keyword: "テスト" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.books)).toBe(true);
    });
  });

  describe("Loan API Integration", () => {
    const testUser = {
      userId: "loanuser123",
      password: "loanpass123",
    };
    const testBook = {
      isbn: "9784167158059",
      title: "貸出テスト書籍",
      author: "貸出テスト著者",
      publisher: "貸出テスト出版社",
    };

    beforeAll(async () => {
      // 貸出テスト用のユーザーと書籍を事前登録
      await request(app).post("/api/user/register").send(testUser);

      await request(app).post("/api/book/register").send(testBook);
    });

    test("POST /api/book/lend - 正常な貸出処理", async () => {
      const lendData = {
        userId: testUser.userId,
        isbn: testBook.isbn,
      };

      const response = await request(app)
        .post("/api/book/lend")
        .send(lendData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("本が正常に貸出されました");
    });

    test("POST /api/book/lend - すでに貸出中の書籍", async () => {
      const lendData = {
        userId: testUser.userId,
        isbn: testBook.isbn,
      };

      const response = await request(app)
        .post("/api/book/lend")
        .send(lendData)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("この本はすでに借りられています");
    });

    test("POST /api/book/return - 正常な返却処理", async () => {
      const returnData = {
        userId: testUser.userId,
        isbn: testBook.isbn,
      };

      const response = await request(app)
        .post("/api/book/return")
        .send(returnData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("本が正常に返却されました");
    });

    test("POST /api/book/return - 貸出されていない書籍", async () => {
      const returnData = {
        userId: testUser.userId,
        isbn: testBook.isbn,
      };

      const response = await request(app)
        .post("/api/book/return")
        .send(returnData)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("この本は貸出されていません");
    });
  });

  describe("Error Handling Integration", () => {
    test("存在しないエンドポイントへのアクセス", async () => {
      const response = await request(app).get("/api/nonexistent").expect(404);

      expect(response.body.success).toBe(false);
    });

    test("無効なJSONデータの送信", async () => {
      const response = await request(app)
        .post("/api/user/register")
        .send("invalid json")
        .set("Content-Type", "application/json")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("必須パラメータの欠落", async () => {
      const response = await request(app)
        .post("/api/user/register")
        .send({ userId: "test" }) // passwordが欠落
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Data Validation Integration", () => {
    test("ISBNの形式検証", async () => {
      const invalidBook = {
        isbn: "123", // 短すぎるISBN
        title: "テスト",
        author: "テスト",
        publisher: "テスト",
      };

      const response = await request(app)
        .post("/api/book/register")
        .send(invalidBook)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("ユーザーIDの形式検証", async () => {
      const invalidUser = {
        userId: "12", // 短すぎるユーザーID
        password: "testpass123",
      };

      const response = await request(app)
        .post("/api/user/register")
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
