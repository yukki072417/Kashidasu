/**
 * Bookモデルの単体テスト
 */

const { createBook, getBookByIsbn, getBookByName, getBookByAuthor, updateBook, deleteBook, deleteAllBooks, getAllBooks } = require("../../../model/bookModel");

// モックの設定
jest.mock("../../../db/models/book");

const BookModel = require("../../../db/models/book");
const mockBookModel = new BookModel();

describe("Book Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBook", () => {
    test("有効な書籍情報で書籍作成が成功する", async () => {
      const isbn = "9784167158057";
      const title = "テスト書籍";
      const author = "テスト著者";
      
      // モックの設定
      mockBookModel.create.mockResolvedValue();
      
      const result = await createBook(isbn, title, author);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に作成されました");
      expect(result.data).toBeNull();
      
      expect(mockBookModel.create).toHaveBeenCalledWith(title, author, isbn);
    });

    test("空のisbnでエラーが発生する", async () => {
      const isbn = "";
      const title = "テスト書籍";
      const author = "テスト著者";
      
      await expect(createBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.create).not.toHaveBeenCalled();
    });

    test("nullのtitleでエラーが発生する", async () => {
      const isbn = "9784167158057";
      const title = null;
      const author = "テスト著者";
      
      await expect(createBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.create).not.toHaveBeenCalled();
    });

    test("空のauthorでエラーが発生する", async () => {
      const isbn = "9784167158057";
      const title = "テスト書籍";
      const author = "";
      
      await expect(createBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.create).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const isbn = "9784167158057";
      const title = "テスト書籍";
      const author = "テスト著者";
      
      // モックの設定
      mockBookModel.create.mockRejectedValue(new Error("Database error"));
      
      await expect(createBook(isbn, title, author)).rejects.toThrow("Database error");
      
      expect(mockBookModel.create).toHaveBeenCalledWith(title, author, isbn);
    });
  });

  describe("getBookByIsbn", () => {
    test("存在するISBNで書籍情報を取得できる", async () => {
      const isbn = "9784167158057";
      const mockBook = { isbn: "9784167158057", title: "テスト書籍", author: "テスト著者" };
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue(mockBook);
      
      const result = await getBookByIsbn(isbn);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBook);
      expect(result.message).toBe("書籍が正常に取得されました");
      
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("存在しないISBNで失敗する", async () => {
      const isbn = "nonexistent";
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue(null);
      
      const result = await getBookByIsbn(isbn);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("書籍が見つかりません");
      
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("空のisbnでエラーが発生する", async () => {
      const isbn = "";
      
      await expect(getBookByIsbn(isbn)).rejects.toThrow("Cannot empty isbn.");
      
      expect(mockBookModel.findOne).not.toHaveBeenCalled();
    });

    test("nullのisbnでエラーが発生する", async () => {
      const isbn = null;
      
      await expect(getBookByIsbn(isbn)).rejects.toThrow("Cannot empty isbn.");
      
      expect(mockBookModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const isbn = "9784167158057";
      
      // モックの設定
      mockBookModel.findOne.mockRejectedValue(new Error("Database error"));
      
      await expect(getBookByIsbn(isbn)).rejects.toThrow("Database error");
      
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("isbnフィールドがない書籍を適切に処理する", async () => {
      const isbn = "9784167158057";
      const mockBook = { title: "テスト書籍", author: "テスト著者" }; // isbnフィールドなし
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue(mockBook);
      
      const result = await getBookByIsbn(isbn);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("書籍が見つかりません");
    });
  });

  describe("getBookByName", () => {
    test("存在するタイトルで書籍情報を取得できる", async () => {
      const title = "テスト書籍";
      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍", author: "テスト著者" },
        { isbn: "9784167158058", title: "別の書籍", author: "別の著者" }
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getBookByName(title);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBooks[0]);
      expect(result.message).toBe("書籍が正常に取得されました");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("存在しないタイトルで失敗する", async () => {
      const title = "存在しない書籍";
      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍", author: "テスト著者" }
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getBookByName(title);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("書籍が見つかりません");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("空のタイトルでエラーが発生する", async () => {
      const title = "";
      
      await expect(getBookByName(title)).rejects.toThrow("Cannot empty title.");
      
      expect(mockBookModel.findAll).not.toHaveBeenCalled();
    });

    test("nullのタイトルでエラーが発生する", async () => {
      const title = null;
      
      await expect(getBookByName(title)).rejects.toThrow("Cannot empty title.");
      
      expect(mockBookModel.findAll).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const title = "テスト書籍";
      
      // モックの設定
      mockBookModel.findAll.mockRejectedValue(new Error("Database error"));
      
      await expect(getBookByName(title)).rejects.toThrow("Database error");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("isbnフィールドがない書籍を適切に処理する", async () => {
      const title = "テスト書籍";
      const mockBooks = [
        { title: "テスト書籍", author: "テスト著者" } // isbnフィールドなし
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getBookByName(title);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("書籍が見つかりません");
    });
  });

  describe("getBookByAuthor", () => {
    test("存在する著者で書籍リストを取得できる", async () => {
      const author = "テスト著者";
      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍1", author: "テスト著者" },
        { isbn: "9784167158058", title: "テスト書籍2", author: "テスト著者" },
        { isbn: "9784167158059", title: "別の書籍", author: "別の著者" }
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getBookByAuthor(author);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].author).toBe(author);
      expect(result.data[1].author).toBe(author);
      expect(result.message).toBe("書籍が正常に取得されました");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("存在しない著者で失敗する", async () => {
      const author = "存在しない著者";
      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍", author: "テスト著者" }
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getBookByAuthor(author);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("書籍が見つかりません");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("空の著者名でエラーが発生する", async () => {
      const author = "";
      
      await expect(getBookByAuthor(author)).rejects.toThrow("Cannot empty author.");
      
      expect(mockBookModel.findAll).not.toHaveBeenCalled();
    });

    test("nullの著者名でエラーが発生する", async () => {
      const author = null;
      
      await expect(getBookByAuthor(author)).rejects.toThrow("Cannot empty author.");
      
      expect(mockBookModel.findAll).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const author = "テスト著者";
      
      // モックの設定
      mockBookModel.findAll.mockRejectedValue(new Error("Database error"));
      
      await expect(getBookByAuthor(author)).rejects.toThrow("Database error");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });
  });

  describe("updateBook", () => {
    test("有効な書籍情報で更新が成功する", async () => {
      const isbn = "9784167158057";
      const title = "更新された書籍";
      const author = "更新された著者";
      
      // モックの設定
      mockBookModel.update.mockResolvedValue();
      
      const result = await updateBook(isbn, title, author);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に更新されました");
      expect(result.data).toBeNull();
      
      expect(mockBookModel.update).toHaveBeenCalledWith(isbn, { title, author });
    });

    test("空のisbnでエラーが発生する", async () => {
      const isbn = "";
      const title = "更新された書籍";
      const author = "更新された著者";
      
      await expect(updateBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.update).not.toHaveBeenCalled();
    });

    test("nullのtitleでエラーが発生する", async () => {
      const isbn = "9784167158057";
      const title = null;
      const author = "更新された著者";
      
      await expect(updateBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.update).not.toHaveBeenCalled();
    });

    test("空のauthorでエラーが発生する", async () => {
      const isbn = "9784167158057";
      const title = "更新された書籍";
      const author = "";
      
      await expect(updateBook(isbn, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(mockBookModel.update).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const isbn = "9784167158057";
      const title = "更新された書籍";
      const author = "更新された著者";
      
      // モックの設定
      mockBookModel.update.mockRejectedValue(new Error("Database error"));
      
      await expect(updateBook(isbn, title, author)).rejects.toThrow("Database error");
      
      expect(mockBookModel.update).toHaveBeenCalledWith(isbn, { title, author });
    });
  });

  describe("deleteBook", () => {
    test("有効なISBNで削除が成功する", async () => {
      const isbn = "9784167158057";
      
      // モックの設定
      mockBookModel.delete.mockResolvedValue();
      
      const result = await deleteBook(isbn);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に削除されました");
      expect(result.data).toBeNull();
      
      expect(mockBookModel.delete).toHaveBeenCalledWith(isbn);
    });

    test("空のisbnでエラーが発生する", async () => {
      const isbn = "";
      
      await expect(deleteBook(isbn)).rejects.toThrow("Cannot empty isbn.");
      
      expect(mockBookModel.delete).not.toHaveBeenCalled();
    });

    test("nullのisbnでエラーが発生する", async () => {
      const isbn = null;
      
      await expect(deleteBook(isbn)).rejects.toThrow("Cannot empty isbn.");
      
      expect(mockBookModel.delete).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const isbn = "9784167158057";
      
      // モックの設定
      mockBookModel.delete.mockRejectedValue(new Error("Database error"));
      
      await expect(deleteBook(isbn)).rejects.toThrow("Database error");
      
      expect(mockBookModel.delete).toHaveBeenCalledWith(isbn);
    });
  });

  describe("deleteAllBooks", () => {
    test("全書籍削除が成功する", async () => {
      // モックの設定
      mockBookModel.deleteAll.mockResolvedValue();
      
      const result = await deleteAllBooks();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("全書籍が正常に削除されました");
      expect(result.data).toBeNull();
      
      expect(mockBookModel.deleteAll).toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      // モックの設定
      mockBookModel.deleteAll.mockRejectedValue(new Error("Database error"));
      
      await expect(deleteAllBooks()).rejects.toThrow("Database error");
      
      expect(mockBookModel.deleteAll).toHaveBeenCalled();
    });
  });

  describe("getAllBooks", () => {
    test("全書籍取得が成功する", async () => {
      const mockBooks = [
        { isbn: "9784167158057", title: "テスト書籍1", author: "テスト著者1" },
        { isbn: "9784167158058", title: "テスト書籍2", author: "テスト著者2" },
        { isbn: "9784167158059", title: "テスト書籍3", author: "テスト著者3" }
      ];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getAllBooks();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBooks);
      expect(result.data).toHaveLength(3);
      expect(result.message).toBe("全書籍が正常に取得されました");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("空の書籍リストを取得できる", async () => {
      const mockBooks = [];
      
      // モックの設定
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const result = await getAllBooks();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.message).toBe("全書籍が正常に取得されました");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      // モックの設定
      mockBookModel.findAll.mockRejectedValue(new Error("Database error"));
      
      await expect(getAllBooks()).rejects.toThrow("Database error");
      
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });
  });

  describe("統合テスト", () => {
    test("書籍のライフサイクル全体が正しく動作する", async () => {
      const isbn = "9784167158057";
      const title = "ライフサイクル書籍";
      const author = "テスト著者";
      const newTitle = "更新された書籍";
      const newAuthor = "更新された著者";
      
      // 1. 書籍作成
      mockBookModel.create.mockResolvedValue();
      
      const createResult = await createBook(isbn, title, author);
      expect(createResult.success).toBe(true);
      
      // 2. 書籍取得（ISBN）
      const mockBook = { isbn, title, author };
      mockBookModel.findOne.mockResolvedValue(mockBook);
      
      const getResult = await getBookByIsbn(isbn);
      expect(getResult.success).toBe(true);
      expect(getResult.data.isbn).toBe(isbn);
      
      // 3. 書籍取得（タイトル）
      const mockBooks = [mockBook];
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const getByNameResult = await getBookByName(title);
      expect(getByNameResult.success).toBe(true);
      expect(getByNameResult.data.title).toBe(title);
      
      // 4. 書籍取得（著者）
      const getByAuthorResult = await getBookByAuthor(author);
      expect(getByAuthorResult.success).toBe(true);
      expect(getByAuthorResult.data).toHaveLength(1);
      expect(getByAuthorResult.data[0].author).toBe(author);
      
      // 5. 全書籍取得
      const getAllResult = await getAllBooks();
      expect(getAllResult.success).toBe(true);
      expect(getAllResult.data).toHaveLength(1);
      
      // 6. 書籍更新
      mockBookModel.update.mockResolvedValue();
      
      const updateResult = await updateBook(isbn, newTitle, newAuthor);
      expect(updateResult.success).toBe(true);
      
      // 7. 書籍削除
      mockBookModel.delete.mockResolvedValue();
      
      const deleteResult = await deleteBook(isbn);
      expect(deleteResult.success).toBe(true);
      
      // 8. 全書籍削除
      mockBookModel.deleteAll.mockResolvedValue();
      
      const deleteAllResult = await deleteAllBooks();
      expect(deleteAllResult.success).toBe(true);
      
      // 9. 削除後の確認
      mockBookModel.findOne.mockResolvedValue(null);
      
      const finalGetResult = await getBookByIsbn(isbn);
      expect(finalGetResult.success).toBe(false);
      expect(finalGetResult.message).toBe("書籍が見つかりません");
    });

    test("複数書籍の検索とフィルタリングが正しく動作する", async () => {
      const mockBooks = [
        { isbn: "9784167158057", title: "JavaScript入門", author: "山田太郎" },
        { isbn: "9784167158058", title: "Python入門", author: "山田太郎" },
        { isbn: "9784167158059", title: "JavaScript実践", author: "鈴木一郎" },
        { isbn: "9784167158060", title: "Node.js入門", author: "佐藤花子" }
      ];
      
      // 全書籍取得
      mockBookModel.findAll.mockResolvedValue(mockBooks);
      
      const allBooksResult = await getAllBooks();
      expect(allBooksResult.data).toHaveLength(4);
      
      // タイトル検索
      const jsBookResult = await getBookByName("JavaScript入門");
      expect(jsBookResult.success).toBe(true);
      expect(jsBookResult.data.title).toBe("JavaScript入門");
      
      // 著者検索（複数件）
      const yamadaBooksResult = await getBookByAuthor("山田太郎");
      expect(yamadaBooksResult.success).toBe(true);
      expect(yamadaBooksResult.data).toHaveLength(2);
      expect(yamadaBooksResult.data[0].author).toBe("山田太郎");
      expect(yamadaBooksResult.data[1].author).toBe("山田太郎");
      
      // 存在しない著者検索
      const noAuthorResult = await getBookByAuthor("存在しない著者");
      expect(noAuthorResult.success).toBe(false);
      expect(noAuthorResult.data).toBeNull();
    });

    test("エラーメッセージの一貫性を確認", async () => {
      const isbn = "9784167158057";
      const title = "テスト書籍";
      const author = "テスト著者";
      
      // 各種エラーメッセージの確認
      expect(async () => await createBook("", title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await createBook(null, title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await createBook(isbn, "", author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await createBook(isbn, null, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await createBook(isbn, title, "")).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await createBook(isbn, title, null)).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(async () => await getBookByIsbn("")).rejects.toThrow("Cannot empty isbn.");
      expect(async () => await getBookByIsbn(null)).rejects.toThrow("Cannot empty isbn.");
      
      expect(async () => await getBookByName("")).rejects.toThrow("Cannot empty title.");
      expect(async () => await getBookByName(null)).rejects.toThrow("Cannot empty title.");
      
      expect(async () => await getBookByAuthor("")).rejects.toThrow("Cannot empty author.");
      expect(async () => await getBookByAuthor(null)).rejects.toThrow("Cannot empty author.");
      
      expect(async () => await updateBook("", title, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await updateBook(isbn, null, author)).rejects.toThrow("Cannot empty isbn, title, and author.");
      expect(async () => await updateBook(isbn, title, "")).rejects.toThrow("Cannot empty isbn, title, and author.");
      
      expect(async () => await deleteBook("")).rejects.toThrow("Cannot empty isbn.");
      expect(async () => await deleteBook(null)).rejects.toThrow("Cannot empty isbn.");
    });

    test("データ整合性の検証", async () => {
      const isbn = "9784167158057";
      const title = "テスト書籍";
      const author = "テスト著者";
      
      // ISBNフィールドがない書籍データ
      const invalidBook = { title, author }; // isbnフィールドなし
      
      mockBookModel.findOne.mockResolvedValue(invalidBook);
      const result1 = await getBookByIsbn(isbn);
      expect(result1.success).toBe(false);
      
      mockBookModel.findAll.mockResolvedValue([invalidBook]);
      const result2 = await getBookByName(title);
      expect(result2.success).toBe(false);
      
      const result3 = await getBookByAuthor(author);
      expect(result3.success).toBe(false);
    });
  });
});
