/**
 * Bookコントローラーの単体テスト
 */

const {
  createBook,
  getBook,
  getAllBooks,
  updateBook,
  deleteBook,
  search,
  lend,
  returnBook,
  getLoanByIsbn,
  getAllLoans,
} = require("../../../controller/bookController");

// モックの設定
jest.mock("../../../model/bookModel");
jest.mock("../../../model/loanModel");

const bookModel = require("../../../model/bookModel");
const loanModel = require("../../../model/loanModel");

describe("Book Controller Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("createBook", () => {
    test("有効な書籍データで作成が成功する", async () => {
      const bookData = {
        isbn: "9784167158057",
        title: "テスト書籍",
        author: "テスト著者",
      };

      mockReq.body = bookData;

      bookModel.createBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に作成されました",
      });

      await createBook(mockReq, mockRes, mockNext);

      expect(bookModel.createBook).toHaveBeenCalledWith(
        "9784167158057",
        "テスト書籍",
        "テスト著者",
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "書籍が正常に作成されました",
      });
    });

    test("isbnがない場合に400エラーを返す", async () => {
      const bookData = {
        title: "テスト書籍",
        author: "テスト著者",
      };

      mockReq.body = bookData;

      await createBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.createBook).not.toHaveBeenCalled();
    });

    test("titleがない場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158057",
        author: "テスト著者",
      };

      mockReq.body = bookData;

      await createBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.createBook).not.toHaveBeenCalled();
    });

    test("authorがない場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158057",
        title: "テスト書籍",
      };

      mockReq.body = bookData;

      await createBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.createBook).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158057",
        title: "テスト書籍",
        author: "テスト著者",
      };

      mockReq.body = bookData;

      bookModel.createBook.mockResolvedValue({
        success: false,
        message: "書籍作成に失敗しました",
      });

      await createBook(mockReq, mockRes, mockNext);

      expect(bookModel.createBook).toHaveBeenCalledWith(
        "9784167158057",
        "テスト書籍",
        "テスト著者",
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "書籍作成に失敗しました",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const bookData = {
        isbn: "9784167158057",
        title: "テスト書籍",
        author: "テスト著者",
      };

      mockReq.body = bookData;

      bookModel.createBook.mockRejectedValue(new Error("データベースエラー"));

      await expect(createBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        "データベースエラー",
      );

      expect(bookModel.createBook).toHaveBeenCalledWith(
        "9784167158057",
        "テスト書籍",
        "テスト著者",
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("getBook", () => {
    test("manual_search_modeで特定書籍取得が成功する", async () => {
      const isbn = "9784167158057";
      mockReq.query = { isbn, manual_search_mode: "true" };

      bookModel.getBookByIsbn.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍", author: "テスト著者" },
        message: "書籍が正常に取得されました",
      });

      await getBook(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByIsbn).toHaveBeenCalledWith(isbn);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { isbn, title: "テスト書籍", author: "テスト著者" },
        message: "書籍が正常に取得されました",
      });
    });

    test("manual_search_modeでisbnがない場合に400エラーを返す", async () => {
      mockReq.query = { manual_search_mode: "true" };

      await getBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBNは必須です",
      });
      expect(bookModel.getBookByIsbn).not.toHaveBeenCalled();
    });

    test("manual_search_modeで書籍が見つからない場合に404エラーを返す", async () => {
      const isbn = "9784167158057";
      mockReq.query = { isbn, manual_search_mode: "true" };

      bookModel.getBookByIsbn.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await getBook(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByIsbn).toHaveBeenCalledWith(isbn);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "書籍が見つかりません",
      });
    });

    test("全書籍取得が成功する", async () => {
      mockReq.query = {};

      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍1", author: "テスト著者1" },
        { isbn: "9784167158058", title: "テスト書籍2", author: "テスト著者2" },
      ];

      bookModel.getAllBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
        message: "全書籍が正常に取得されました",
      });

      await getBook(mockReq, mockRes, mockNext);

      expect(bookModel.getAllBooks).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [{ "COUNT(isbn)": 2 }, ...mockBooks],
        message: "書籍一覧が正常に取得されました",
      });
    });

    test("全書籍取得でページングが機能する", async () => {
      mockReq.query = { page: "2", limit: "10" };

      const mockBooks = Array.from({ length: 25 }, (_, i) => ({
        isbn: `978416715805${i}`,
        title: `テスト書籍${i}`,
        author: `テスト著者${i}`,
      }));

      bookModel.getAllBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
        message: "全書籍が正常に取得されました",
      });

      await getBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(11); // COUNT + 10件
      expect(responseData.data[0]).toEqual({ "COUNT(isbn)": 25 });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      mockReq.query = { manual_search_mode: "true", isbn: "9784167158057" };

      bookModel.getBookByIsbn.mockRejectedValue(
        new Error("データベースエラー"),
      );

      await expect(getBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        "データベースエラー",
      );

      expect(bookModel.getBookByIsbn).toHaveBeenCalledWith("9784167158057");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("updateBook", () => {
    test("書籍情報更新が成功する", async () => {
      const bookData = {
        before_isbn: "9784167158057",
        isbn: "9784167158058",
        title: "更新書籍",
        author: "更新著者",
      };

      mockReq.body = bookData;

      bookModel.updateBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に更新されました",
      });

      await updateBook(mockReq, mockRes, mockNext);

      expect(bookModel.updateBook).toHaveBeenCalledWith(
        "9784167158058",
        "更新書籍",
        "更新著者",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "書籍が正常に更新されました",
      });
    });

    test("isbnがない場合に400エラーを返す", async () => {
      const bookData = {
        title: "更新書籍",
        author: "更新著者",
      };

      mockReq.body = bookData;

      await updateBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.updateBook).not.toHaveBeenCalled();
    });

    test("titleがない場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158058",
        author: "更新著者",
      };

      mockReq.body = bookData;

      await updateBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.updateBook).not.toHaveBeenCalled();
    });

    test("authorがない場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158058",
        title: "更新書籍",
      };

      mockReq.body = bookData;

      await updateBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBN、タイトル、著者名は必須です",
      });
      expect(bookModel.updateBook).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158058",
        title: "更新書籍",
        author: "更新著者",
      };

      mockReq.body = bookData;

      bookModel.updateBook.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await updateBook(mockReq, mockRes, mockNext);

      expect(bookModel.updateBook).toHaveBeenCalledWith(
        "9784167158058",
        "更新書籍",
        "更新著者",
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "書籍が見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const bookData = {
        isbn: "9784167158058",
        title: "更新書籍",
        author: "更新著者",
      };

      mockReq.body = bookData;

      bookModel.updateBook.mockRejectedValue(new Error("データベースエラー"));

      await expect(updateBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        "データベースエラー",
      );

      expect(bookModel.updateBook).toHaveBeenCalledWith(
        "9784167158058",
        "更新書籍",
        "更新著者",
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("deleteBook", () => {
    test("個別書籍削除が成功する", async () => {
      const bookData = {
        isbn: "9784167158057",
        all_delete: false,
      };

      mockReq.body = bookData;

      bookModel.deleteBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に削除されました",
      });

      await deleteBook(mockReq, mockRes, mockNext);

      expect(bookModel.deleteBook).toHaveBeenCalledWith("9784167158057");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "書籍が正常に削除されました",
      });
    });

    test("全書籍削除が成功する", async () => {
      const bookData = {
        all_delete: true,
      };

      mockReq.body = bookData;

      bookModel.deleteAllBooks.mockResolvedValue({
        success: true,
        data: null,
        message: "全書籍が正常に削除されました",
      });

      await deleteBook(mockReq, mockRes, mockNext);

      expect(bookModel.deleteAllBooks).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "全書籍が正常に削除されました",
      });
    });

    test("個別削除でisbnがない場合に400エラーを返す", async () => {
      const bookData = {
        all_delete: false,
      };

      mockReq.body = bookData;

      await deleteBook(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ISBNは必須です",
      });
      expect(bookModel.deleteBook).not.toHaveBeenCalled();
    });

    test("個別削除でモデルが失敗を返した場合に404エラーを返す", async () => {
      const bookData = {
        isbn: "9784167158057",
        all_delete: false,
      };

      mockReq.body = bookData;

      bookModel.deleteBook.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await deleteBook(mockReq, mockRes, mockNext);

      expect(bookModel.deleteBook).toHaveBeenCalledWith("9784167158057");
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "書籍が見つかりません",
      });
    });

    test("全削除でモデルが失敗を返した場合に500エラーを返す", async () => {
      const bookData = {
        all_delete: true,
      };

      mockReq.body = bookData;

      bookModel.deleteAllBooks.mockResolvedValue({
        success: false,
        message: "削除に失敗しました",
      });

      await deleteBook(mockReq, mockRes, mockNext);

      expect(bookModel.deleteAllBooks).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "削除に失敗しました",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const bookData = {
        isbn: "9784167158057",
        all_delete: false,
      };

      mockReq.body = bookData;

      bookModel.deleteBook.mockRejectedValue(new Error("データベースエラー"));

      await expect(deleteBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        "データベースエラー",
      );

      expect(bookModel.deleteBook).toHaveBeenCalledWith("9784167158057");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    test("ISBN検索が成功する", async () => {
      const searchData = {
        query: "9784167158057",
        searchType: "isbn",
      };

      mockReq.body = searchData;

      bookModel.getBookByIsbn.mockResolvedValue({
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "書籍が正常に取得されました",
      });

      await search(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByIsbn).toHaveBeenCalledWith("9784167158057");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "検索が正常に完了しました",
      });
    });

    test("タイトル検索が成功する", async () => {
      const searchData = {
        query: "テスト書籍",
        searchType: "title",
      };

      mockReq.body = searchData;

      bookModel.getBookByName.mockResolvedValue({
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "書籍が正常に取得されました",
      });

      await search(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByName).toHaveBeenCalledWith("テスト書籍");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "検索が正常に完了しました",
      });
    });

    test("著者検索が成功する", async () => {
      const searchData = {
        query: "テスト著者",
        searchType: "author",
      };

      mockReq.body = searchData;

      bookModel.getBookByAuthor.mockResolvedValue({
        success: true,
        data: [
          { isbn: "9784167158057", title: "テスト書籍1", author: "テスト著者" },
          { isbn: "9784167158058", title: "テスト書籍2", author: "テスト著者" },
        ],
        message: "書籍が正常に取得されました",
      });

      await search(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByAuthor).toHaveBeenCalledWith("テスト著者");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { isbn: "9784167158057", title: "テスト書籍1", author: "テスト著者" },
          { isbn: "9784167158058", title: "テスト書籍2", author: "テスト著者" },
        ],
        message: "検索が正常に完了しました",
      });
    });

    test("queryがない場合に400エラーを返す", async () => {
      const searchData = {
        searchType: "isbn",
      };

      mockReq.body = searchData;

      await search(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "検索クエリと検索タイプは必須です",
      });
      expect(bookModel.getBookByIsbn).not.toHaveBeenCalled();
    });

    test("searchTypeがない場合に400エラーを返す", async () => {
      const searchData = {
        query: "9784167158057",
      };

      mockReq.body = searchData;

      await search(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "検索クエリと検索タイプは必須です",
      });
      expect(bookModel.getBookByIsbn).not.toHaveBeenCalled();
    });

    test("無効なsearchTypeの場合に400エラーを返す", async () => {
      const searchData = {
        query: "9784167158057",
        searchType: "invalid",
      };

      mockReq.body = searchData;

      await search(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "無効な検索タイプです",
      });
      expect(bookModel.getBookByIsbn).not.toHaveBeenCalled();
    });

    test("検索結果がない場合に空配列を返す", async () => {
      const searchData = {
        query: "存在しない書籍",
        searchType: "title",
      };

      mockReq.body = searchData;

      bookModel.getBookByName.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await search(mockReq, mockRes, mockNext);

      expect(bookModel.getBookByName).toHaveBeenCalledWith("存在しない書籍");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: "検索結果がありません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const searchData = {
        query: "9784167158057",
        searchType: "isbn",
      };

      mockReq.body = searchData;

      bookModel.getBookByIsbn.mockRejectedValue(
        new Error("データベースエラー"),
      );

      await expect(search(mockReq, mockRes, mockNext)).rejects.toThrow(
        "データベースエラー",
      );

      expect(bookModel.getBookByIsbn).toHaveBeenCalledWith("9784167158057");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("貸出・返却機能", () => {
    describe("lend", () => {
      test("書籍貸出が成功する", async () => {
        const lendData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = lendData;

        loanModel.lendBook.mockResolvedValue({
          success: true,
          data: { loanId: "123456789", dueDate: "2026-03-17" },
          message: "書籍が正常に貸出されました",
        });

        await lend(mockReq, mockRes, mockNext);

        expect(loanModel.lendBook).toHaveBeenCalledWith(
          "9784167158057",
          "testuser",
          expect.any(String),
        );
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: "書籍が正常に貸出されました",
          data: { loanId: "123456789", dueDate: "2026-03-17" },
        });
      });

      test("user_idがない場合に400エラーを返す", async () => {
        const lendData = {
          isbn: "9784167158057",
        };

        mockReq.body = lendData;

        await lend(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "ユーザーIDとISBNは必須です",
        });
        expect(loanModel.lendBook).not.toHaveBeenCalled();
      });

      test("isbnがない場合に400エラーを返す", async () => {
        const lendData = {
          user_id: "testuser",
        };

        mockReq.body = lendData;

        await lend(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "ユーザーIDとISBNは必須です",
        });
        expect(loanModel.lendBook).not.toHaveBeenCalled();
      });

      test("書籍が存在しない場合に400エラーを返す", async () => {
        const lendData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = lendData;

        loanModel.lendBook.mockRejectedValue(new Error("BOOK_NOT_EXIST"));

        await lend(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "指定された本が見つかりません",
        });
      });

      test("書籍が既に貸出中の場合に400エラーを返す", async () => {
        const lendData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = lendData;

        loanModel.lendBook.mockRejectedValue(new Error("BOOK_ALREADY_LENDING"));

        await lend(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "この本はすでに貸出中です",
        });
      });
    });

    describe("returnBook", () => {
      test("書籍返却が成功する", async () => {
        const returnData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = returnData;

        loanModel.returnBook.mockResolvedValue({
          success: true,
          data: null,
          message: "書籍が正常に返却されました",
        });

        await returnBook(mockReq, mockRes, mockNext);

        expect(loanModel.returnBook).toHaveBeenCalledWith(
          "9784167158057",
          "testuser",
          expect.any(String),
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: "書籍が正常に返却されました",
          data: null,
        });
      });

      test("user_idがない場合に400エラーを返す", async () => {
        const returnData = {
          isbn: "9784167158057",
        };

        mockReq.body = returnData;

        await returnBook(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "ユーザーIDとISBNは必須です",
        });
        expect(loanModel.returnBook).not.toHaveBeenCalled();
      });

      test("isbnがない場合に400エラーを返す", async () => {
        const returnData = {
          user_id: "testuser",
        };

        mockReq.body = returnData;

        await returnBook(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "ユーザーIDとISBNは必須です",
        });
        expect(loanModel.returnBook).not.toHaveBeenCalled();
      });

      test("書籍が存在しない場合に400エラーを返す", async () => {
        const returnData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = returnData;

        loanModel.returnBook.mockRejectedValue(new Error("BOOK_NOT_EXIST"));

        await returnBook(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "指定された本が見つかりません",
        });
      });

      test("書籍が貸出されていない場合に400エラーを返す", async () => {
        const returnData = {
          user_id: "testuser",
          isbn: "9784167158057",
        };

        mockReq.body = returnData;

        loanModel.returnBook.mockRejectedValue(new Error("BOOK_NOT_LENDING"));

        await returnBook(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "この本は貸出されていません",
        });
      });
    });
  });

  describe("貸出情報取得", () => {
    describe("getLoanByIsbn", () => {
      test("ISBNで貸出情報取得が成功する", async () => {
        const isbn = "9784167158057";
        mockReq.query = { isbn };

        const mockLoans = [
          {
            loanId: "123",
            bookId: isbn,
            userId: "user1",
            loanDate: "2026-03-10",
            dueDate: "2026-03-17",
          },
          {
            loanId: "124",
            bookId: "other-isbn",
            userId: "user2",
            loanDate: "2026-03-11",
            dueDate: "2026-03-18",
          },
        ];

        loanModel.getUserLoans.mockResolvedValue({
          success: true,
          data: mockLoans,
        });

        bookModel.getBookByIsbn.mockResolvedValue({
          success: true,
          data: { isbn, title: "テスト書籍", author: "テスト著者" },
        });

        await getLoanByIsbn(mockReq, mockRes, mockNext);

        expect(loanModel.getUserLoans).toHaveBeenCalled();
        expect(bookModel.getBookByIsbn).toHaveBeenCalledWith(isbn);
        expect(mockRes.status).toHaveBeenCalledWith(200);

        const responseData = mockRes.json.mock.calls[0][0];
        expect(responseData.success).toBe(true);
        expect(responseData.data).toHaveLength(1);
        expect(responseData.data[0]).toHaveProperty("bookInfo");
      });

      test("isbnがない場合に400エラーを返す", async () => {
        mockReq.query = {};

        await getLoanByIsbn(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: "ISBNは必須です",
        });
        expect(loanModel.getUserLoans).not.toHaveBeenCalled();
      });

      test("貸出情報がない場合にnullを返す", async () => {
        const isbn = "9784167158057";
        mockReq.query = { isbn };

        loanModel.getUserLoans.mockResolvedValue({
          success: true,
          data: [],
        });

        await getLoanByIsbn(mockReq, mockRes, mockNext);

        expect(loanModel.getUserLoans).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          data: null,
          message: "このISBNのアクティブな貸出が見つかりません",
        });
      });
    });

    describe("getAllLoans", () => {
      test("全貸出情報取得が成功する", async () => {
        mockReq.query = { limit: "10" };

        const mockLoans = [
          {
            loanId: "123",
            bookId: "9784167158057",
            userId: "user1",
            loanDate: "2026-03-10",
            dueDate: "2026-03-17",
          },
          {
            loanId: "124",
            bookId: "9784167158058",
            userId: "user2",
            loanDate: "2026-03-11",
            dueDate: "2026-03-18",
          },
        ];

        loanModel.getUserLoans.mockResolvedValue({
          success: true,
          data: mockLoans,
        });

        bookModel.getBookByIsbn.mockResolvedValue({
          success: true,
          data: { title: "テスト書籍", author: "テスト著者" },
        });

        await getAllLoans(mockReq, mockRes, mockNext);

        expect(loanModel.getUserLoans).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);

        const responseData = mockRes.json.mock.calls[0][0];
        expect(responseData.success).toBe(true);
        expect(responseData.data).toHaveLength(2);
        expect(responseData.count).toBe(2);
        expect(responseData.totalActive).toBe(2);
      });

      test("デフォルト制限件数が100であること", async () => {
        mockReq.query = {};

        loanModel.getUserLoans.mockResolvedValue({
          success: true,
          data: [],
        });

        await getAllLoans(mockReq, mockRes, mockNext);

        expect(loanModel.getUserLoans).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });
  });

  describe("統合テスト", () => {
    test("書籍操作の全フローが正しく動作する", async () => {
      // 1. 作成
      const bookData = {
        isbn: "9784167158057",
        title: "テスト書籍",
        author: "テスト著者",
      };

      mockReq.body = bookData;
      bookModel.createBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に作成されました",
      });

      await createBook(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // 2. 取得
      jest.clearAllMocks();
      mockReq.query = { isbn: "9784167158057", manual_search_mode: "true" };
      bookModel.getBookByIsbn.mockResolvedValue({
        success: true,
        data: {
          isbn: "9784167158057",
          title: "テスト書籍",
          author: "テスト著者",
        },
        message: "書籍が正常に取得されました",
      });

      await getBook(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 3. 更新
      jest.clearAllMocks();
      mockReq.body = {
        isbn: "9784167158057",
        title: "更新書籍",
        author: "更新著者",
      };
      bookModel.updateBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に更新されました",
      });

      await updateBook(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 4. 削除
      jest.clearAllMocks();
      mockReq.body = { isbn: "9784167158057", all_delete: false };
      bookModel.deleteBook.mockResolvedValue({
        success: true,
        data: null,
        message: "書籍が正常に削除されました",
      });

      await deleteBook(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
