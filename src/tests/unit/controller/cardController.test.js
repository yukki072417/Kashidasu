/**
 * Cardコントローラーの単体テスト
 */

// モックの設定
jest.mock("../../../services/cardService");

const CardModel = require("../../../services/cardService");
const {
  generateCard,
  getCardStatus,
  setCardModelInstance,
} = require("../../../controller/cardController");

const mockCardModel = new CardModel();

describe("Card Controller Tests", () => {
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

    // モックの設定
    mockCardModel.generateCard = jest.fn().mockResolvedValue({
      success: true,
      data: { pdfPath: "/pdf/kashidasu_card.pdf" },
      message: "カードが正常に生成されました",
    });

    mockCardModel.getCardFiles = jest.fn().mockResolvedValue({
      success: true,
      data: [{ file: "card1.pdf" }, { file: "card2.pdf" }],
      message: "カードファイル一覧が正常に取得されました",
    });

    // 依存性注入
    setCardModelInstance(mockCardModel);
  });

  describe("generateCard", () => {
    test("有効なカードデータでカード生成が成功する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      // モックの設定
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });
    });

    test("idがない場合に400エラーを返す", async () => {
      const cardData = {
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(mockCardModel.generateCard).not.toHaveBeenCalled();
    });

    test("greadがない場合に400エラーを返す", async () => {
      const cardData = {
        id: "1234567890",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(mockCardModel.generateCard).not.toHaveBeenCalled();
    });

    test("classがない場合に400エラーを返す", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        number: "01",
      };

      mockReq.body = cardData;

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(mockCardModel.generateCard).not.toHaveBeenCalled();
    });

    test("numberがない場合に400エラーを返す", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
      };

      mockReq.body = cardData;

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(mockCardModel.generateCard).not.toHaveBeenCalled();
    });

    test("空のリクエストボディで400エラーを返す", async () => {
      mockReq.body = {};

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(mockCardModel.generateCard).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      // モックの設定
      mockCardModel.generateCard.mockResolvedValue({
        success: false,
        message: "カード生成に失敗しました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "カード生成に失敗しました",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      // モックの設定
      mockCardModel.generateCard.mockRejectedValue(
        new Error("カード生成エラー"),
      );

      // コントローラー関数を実行
      await generateCard(mockReq, mockRes, mockNext);

      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test("レスポンス形式が正しいことを確認", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      mockReq.body = cardData;

      // モックの設定
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      // レスポンス構造の確認
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty(
        "message",
        "カードが正常に生成されました",
      );
      expect(response).toHaveProperty("data");
      expect(response.data).toHaveProperty(
        "pdfPath",
        "/pdf/kashidasu_card.pdf",
      );
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
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      expect(mockCardModel.getCardFiles).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
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
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルが存在しません",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          pdfExists: false,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルが存在しません",
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
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          pdfExists: true,
          pngExists: true,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      });
    });

    test("モデルが失敗を返した場合に500エラーを返す", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: false,
        message: "ファイルアクセスエラー",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ファイルアクセスエラー",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockRejectedValue(
        new Error("ファイルアクセスエラー"),
      );

      // コントローラー関数を実行
      await getCardStatus(mockReq, mockRes, mockNext);

      expect(mockCardModel.getCardFiles).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test("レスポンス形式が正しいことを確認", async () => {
      // モックの設定
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      // レスポンス構造の確認
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty(
        "message",
        "カードファイルステータスが正常に取得されました",
      );
      expect(response).toHaveProperty("data");
      expect(response.data).toHaveProperty("pdfExists");
      expect(response.data).toHaveProperty("pngExists");
      expect(response.data).toHaveProperty("pdfPath");
      expect(response.data).toHaveProperty("pngPath");
    });
  });

  describe("リクエスト処理", () => {
    test("リクエストボディのデストラクチャリングが正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "2年生",
        class: "B組",
        number: "15",
      };

      mockReq.body = cardData;

      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      // サービス層に渡されたデータを確認
      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "2年生",
        class: "B組",
        number: "15",
      });
    });

    test("classプロパティのリネームが正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組", // 元のプロパティ名
        number: "01",
      };

      mockReq.body = cardData;

      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      // classプロパティがclassNameとして渡されていることを確認
      expect(mockCardModel.generateCard).toHaveBeenCalledWith({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      });
    });
  });

  describe("統合テスト", () => {
    test("カード生成からステータス確認までのフロー", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01",
      };

      // 1. カード生成
      mockReq.body = cardData;
      mockCardModel.generateCard.mockResolvedValue({
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      });

      await generateCard(mockReq, mockRes, mockNext);

      const generateResponse = mockRes.json.mock.calls[0][0];
      expect(generateResponse.success).toBe(true);
      expect(generateResponse.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // 2. ステータス確認
      jest.clearAllMocks();
      mockCardModel.getCardFiles.mockResolvedValue({
        success: true,
        data: {
          pdfExists: true,
          pngExists: false,
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      const statusResponse = mockRes.json.mock.calls[0][0];
      expect(statusResponse.success).toBe(true);
      expect(statusResponse.data.pdfExists).toBe(true);
      expect(statusResponse.data.pngExists).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("エラー時のレスポンス形式の一貫性", async () => {
      // generateCardのエラー
      mockReq.body = {};
      mockCardModel.generateCard.mockResolvedValue({
        success: false,
        message: "生成エラー",
      });

      await generateCard(mockReq, mockRes, mockNext);

      const generateErrorResponse = mockRes.json.mock.calls[0][0];
      expect(generateErrorResponse).toHaveProperty("success", false);
      expect(generateErrorResponse).toHaveProperty("message");
      expect(mockRes.status).toHaveBeenCalledWith(400);

      jest.clearAllMocks();

      // getCardStatusのエラー
      mockCardModel.getCardFiles.mockResolvedValue({
        success: false,
        message: "ステータスエラー",
      });

      await getCardStatus(mockReq, mockRes, mockNext);

      const statusErrorResponse = mockRes.json.mock.calls[0][0];
      expect(statusErrorResponse).toHaveProperty("success", false);
      expect(statusErrorResponse).toHaveProperty("message");
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
