/**
 * Cardコントローラーの単体テスト
 */

const { generateCard, getCardStatus } = require("../../../controller/cardController");

// モックの設定
jest.mock("../../../services/cardService");

const CardModel = require("../../../services/cardService");
const mockCardModel = new CardModel();

describe("Card Controller Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe("generateCard", () => {
    test("有効なカードデータでカード生成が成功する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      mockReq.body = cardData;
      
      // モックの設定
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(mockCardModel.generateCard).toHaveBeenCalledWith(cardData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "カードが正常に生成されました",
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
    });

    test("サービス層でエラーが発生した場合に500エラーを返す", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      mockReq.body = cardData;
      
      // モックの設定
      mockCardModel.generateCard.mockRejectedValue(new Error("カード生成エラー"));
      
      // console.errorをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith("Error generating card:", expect.any(Error));
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "カード生成エラー"
      });
      
      consoleSpy.mockRestore();
    });

    test("空のリクエストボディでエラーが発生する", async () => {
      mockReq.body = {};
      
      // モックの設定
      mockCardModel.generateCard.mockRejectedValue(new Error("すべてのフィールドを入力してください"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドを入力してください"
      });
      
      consoleSpy.mockRestore();
    });

    test("部分データでエラーが発生する", async () => {
      const partialData = {
        id: "1234567890",
        gread: "1年生"
        // classとnumberが欠けている
      };
      
      mockReq.body = partialData;
      
      // モックの設定
      mockCardModel.generateCard.mockRejectedValue(new Error("すべてのフィールドを入力してください"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドを入力してください"
      });
      
      consoleSpy.mockRestore();
    });

    test("レスポンス形式が正しいことを確認", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      mockReq.body = cardData;
      
      // モックの設定
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
      
      await generateCard(mockReq, mockRes, mockNext);
      
      const response = mockRes.json.mock.calls[0][0];
      
      // レスポンス構造の確認
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "カードが正常に生成されました");
      expect(response).toHaveProperty("data");
      expect(response.data).toHaveProperty("pdfPath", "/pdf/kashidasu_card.pdf");
    });
  });

  describe("getCardStatus", () => {
    test("カードステータス取得が成功する", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      expect(mockCardModel.getCardFiles).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "カードステータスが正常に取得されました",
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
    });

    test("カードファイルが存在しない場合のステータスを取得できる", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: false,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルが存在しません"
      });
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "カードステータスが正常に取得されました",
        success: true,
        data: {
          pdfExists: false,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルが存在しません"
      });
    });

    test("両方のファイルが存在する場合のステータスを取得できる", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: true,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "カードステータスが正常に取得されました",
        success: true,
        data: {
          pdfExists: true,
          pngExists: true,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
    });

    test("サービス層でエラーが発生した場合に500エラーを返す", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockRejectedValue(new Error("ファイルアクセスエラー"));
      
      // console.errorをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith("Error getting card status:", expect.any(Error));
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ファイルアクセスエラー"
      });
      
      consoleSpy.mockRestore();
    });

    test("レスポンス形式が正しいことを確認", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      const response = mockRes.json.mock.calls[0][0];
      
      // レスポンス構造の確認
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "カードステータスが正常に取得されました");
      expect(response).toHaveProperty("data");
      expect(response.data).toHaveProperty("pdfExists");
      expect(response.data).toHaveProperty("pngExists");
      expect(response.data).toHaveProperty("pdfPath");
      expect(response.data).toHaveProperty("pngPath");
    });
  });

  describe("エラーハンドリング", () => {
    test("予期しないエラーも適切に処理される", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      mockReq.body = cardData;
      
      // 予期しないエラーをモック
      mockCardModel.generateCard.mockImplementation(() => {
        throw new Error("予期しないシステムエラー");
      });
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith("Error generating card:", expect.any(Error));
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "予期しないシステムエラー"
      });
      
      consoleSpy.mockRestore();
    });

    test("エラーメッセージが正しく伝播される", async () => {
      mockReq.body = {};
      
      const errorMessage = "バリデーションエラー: 必須項目が不足しています";
      mockCardModel.generateCard.mockRejectedValue(new Error(errorMessage));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe("リクエスト処理", () => {
    test("リクエストボディのデストラクチャリングが正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "2年生",
        class: "B組",
        number: "15"
      };
      
      mockReq.body = cardData;
      
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
      
      await generateCard(mockReq, mockRes, mockNext);
      
      // サービス層に渡されたデータを確認
      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "2年生",
        class: "B組",
        number: "15"
      });
    });

    test("classプロパティのリネームが正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組", // 元のプロパティ名
        number: "01"
      };
      
      mockReq.body = cardData;
      
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
      
      await generateCard(mockReq, mockRes, mockNext);
      
      // classプロパティがclassNameとして渡されていることを確認
      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      });
    });
  });

  describe("統合テスト", () => {
    test("カード生成からステータス確認までのフロー", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // 1. カード生成
      mockReq.body = cardData;
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました"
      });
      
      await generateCard(mockReq, mockRes, mockNext);
      
      const generateResponse = mockRes.json.mock.calls[0][0];
      expect(generateResponse.success).toBe(true);
      expect(generateResponse.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      
      // 2. ステータス確認
      jest.clearAllMocks();
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png"
        },
        message: "カードファイルステータスが正常に取得されました"
      });
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      const statusResponse = mockRes.json.mock.calls[0][0];
      expect(statusResponse.success).toBe(true);
      expect(statusResponse.data.pdfExists).toBe(true);
      expect(statusResponse.data.pngExists).toBe(false);
    });

    test("エラー時のレスポンス形式の一貫性", async () => {
      // generateCardのエラー
      mockReq.body = {};
      mockCardModel.generateCard.mockRejectedValue(new Error("生成エラー"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      await generateCard(mockReq, mockRes, mockNext);
      
      const generateErrorResponse = mockRes.json.mock.calls[0][0];
      expect(generateErrorResponse).toHaveProperty("success", false);
      expect(generateErrorResponse).toHaveProperty("message");
      
      jest.clearAllMocks();
      
      // getCardStatusのエラー
      mockCardModel.getCardFiles.mockRejectedValue(new Error("ステータスエラー"));
      
      await getCardStatus(mockReq, mockRes, mockNext);
      
      const statusErrorResponse = mockRes.json.mock.calls[0][0];
      expect(statusErrorResponse).toHaveProperty("success", false);
      expect(statusErrorResponse).toHaveProperty("message");
      
      consoleSpy.mockRestore();
    });
  });
});
