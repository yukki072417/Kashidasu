/**
 * Cardサービスの単体テスト
 */

const CardModel = require("../../../services/cardService");
const fs = require("fs");
const path = require("path");

describe("Card Service Tests", () => {
  let cardService;
  const testOutputDir = "./src/test-pdf";

  beforeEach(() => {
    // テスト用のCardServiceインスタンスを作成
    cardService = new CardModel();
    cardService.outputDir = testOutputDir;
    
    // テスト用ディレクトリをクリーンアップ
    if (fs.existsSync(testOutputDir)) {
      const files = fs.readdirSync(testOutputDir);
      files.forEach(file => {
        const filePath = path.join(testOutputDir, file);
        fs.unlinkSync(filePath);
      });
      fs.rmdirSync(testOutputDir);
    }
  });

  afterEach(() => {
    // テスト用ディレクトリをクリーンアップ
    if (fs.existsSync(testOutputDir)) {
      const files = fs.readdirSync(testOutputDir);
      files.forEach(file => {
        const filePath = path.join(testOutputDir, file);
        fs.unlinkSync(filePath);
      });
      fs.rmdirSync(testOutputDir);
    }
  });

  describe("コンストラクタ", () => {
    test("CardServiceインスタンスが正しく作成される", () => {
      const service = new CardModel();
      
      expect(service).toBeInstanceOf(CardModel);
      expect(service.outputDir).toContain("pdf");
      expect(typeof service.ensureOutputDir).toBe("function");
      expect(typeof service.generateCard).toBe("function");
      expect(typeof service.createDummyPdf).toBe("function");
      expect(typeof service.getCardFiles).toBe("function");
    });

    test("出力ディレクトリパスが正しく設定される", () => {
      const service = new CardModel();
      const expectedPath = path.join(__dirname, "../public/pdf");
      
      expect(service.outputDir).toBe(expectedPath);
      expect(path.isAbsolute(service.outputDir)).toBe(false); // 相対パスであること
    });
  });

  describe("ensureOutputDir", () => {
    test("出力ディレクトリが存在しない場合に作成される", () => {
      // ディレクトリが存在しないことを確認
      expect(fs.existsSync(testOutputDir)).toBe(false);
      
      // ディレクトリを作成
      cardService.ensureOutputDir();
      
      // ディレクトリが作成されたことを確認
      expect(fs.existsSync(testOutputDir)).toBe(true);
      expect(fs.statSync(testOutputDir).isDirectory()).toBe(true);
    });

    test("出力ディレクトリが既に存在する場合に何もしない", () => {
      // 事前にディレクトリを作成
      fs.mkdirSync(testOutputDir, { recursive: true });
      const originalStats = fs.statSync(testOutputDir);
      
      // 再度ensureOutputDirを呼び出す
      cardService.ensureOutputDir();
      
      // ディレクトリが存在し、変更されていないことを確認
      expect(fs.existsSync(testOutputDir)).toBe(true);
      expect(fs.statSync(testOutputDir).isDirectory()).toBe(true);
    });

    test("ネストされたディレクトリも作成できる", () => {
      const nestedDir = path.join(testOutputDir, "nested", "deep");
      
      // ネストされたディレクトリを作成
      cardService.outputDir = nestedDir;
      cardService.ensureOutputDir();
      
      // ネストされたディレクトリが作成されたことを確認
      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.statSync(nestedDir).isDirectory()).toBe(true);
    });
  });

  describe("generateCard", () => {
    test("有効なカードデータでPDFが生成される", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      const result = await cardService.generateCard(cardData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードが正常に生成されました");
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      
      // PDFファイルが作成されたことを確認
      const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
      expect(fs.existsSync(pdfPath)).toBe(true);
      
      // PDFファイルの内容を確認
      const content = fs.readFileSync(pdfPath, "binary");
      expect(content).toContain("%PDF-1.4");
      expect(content).toContain("学生証カード");
    });

    test("空のidでエラーが発生する", async () => {
      const cardData = {
        id: "",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      await expect(cardService.generateCard(cardData)).rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("nullのidでエラーが発生する", async () => {
      const cardData = {
        id: null,
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      await expect(cardService.generateCard(cardData)).rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("空のgreadでエラーが発生する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "",
        class: "A組",
        number: "01"
      };
      
      await expect(cardService.generateCard(cardData)).rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("空のclassでエラーが発生する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "",
        number: "01"
      };
      
      await expect(cardService.generateCard(cardData)).rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("空のnumberでエラーが発生する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: ""
      };
      
      await expect(cardService.generateCard(cardData)).rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("特殊文字を含むカードデータでPDFが生成される", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "特別クラス",
        number: "01"
      };
      
      const result = await cardService.generateCard(cardData);
      
      expect(result.success).toBe(true);
      
      const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
      expect(fs.existsSync(pdfPath)).toBe(true);
    });

    test("既存のPDFファイルを上書きできる", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // 最初のPDFを生成
      const result1 = await cardService.generateCard(cardData);
      expect(result1.success).toBe(true);
      
      const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
      const originalStats = fs.statSync(pdfPath);
      
      // 少し待機してから再度生成（ファイルのタイムスタンプが変わることを確認）
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 2回目のPDFを生成
      const result2 = await cardService.generateCard(cardData);
      expect(result2.success).toBe(true);
      
      const newStats = fs.statSync(pdfPath);
      expect(newStats.mtime.getTime()).toBeGreaterThan(originalStats.mtime.getTime());
    });
  });

  describe("createDummyPdf", () => {
    test("ダミーPDFファイルが正しく作成される", () => {
      const pdfPath = path.join(testOutputDir, "test.pdf");
      
      cardService.createDummyPdf(pdfPath);
      
      expect(fs.existsSync(pdfPath)).toBe(true);
      
      const content = fs.readFileSync(pdfPath, "binary");
      expect(content).toContain("%PDF-1.4");
      expect(content).toContain("学生証カード");
      expect(content).toContain("%%EOF");
    });

    test("PDFファイルのバイナリ形式が正しい", () => {
      const pdfPath = path.join(testOutputDir, "test.pdf");
      
      cardService.createDummyPdf(pdfPath);
      
      const content = fs.readFileSync(pdfPath, "binary");
      
      // PDFヘッダーの確認
      expect(content.startsWith("%PDF-")).toBe(true);
      
      // PDFトレーラーの確認
      expect(content).toContain("%%EOF");
      
      // PDFオブジェクトの確認
      expect(content).toContain("obj");
      expect(content).toContain("endobj");
    });
  });

  describe("getCardFiles", () => {
    test("カードファイルが存在しない場合に正しいステータスを返す", async () => {
      const result = await cardService.getCardFiles();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードファイルが存在しません");
      expect(result.data.pdfExists).toBe(false);
      expect(result.data.pngExists).toBe(false);
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      expect(result.data.pngPath).toBe("/pdf/kashidasu_card.png");
    });

    test("PDFファイルのみ存在する場合に正しいステータスを返す", async () => {
      // PDFファイルを作成
      const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
      cardService.createDummyPdf(pdfPath);
      
      const result = await cardService.getCardFiles();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードファイルステータスが正常に取得されました");
      expect(result.data.pdfExists).toBe(true);
      expect(result.data.pngExists).toBe(false);
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      expect(result.data.pngPath).toBe("/pdf/kashidasu_card.png");
    });

    test("PNGファイルのみ存在する場合に正しいステータスを返す", async () => {
      // PNGファイルを作成
      const pngPath = path.join(testOutputDir, "kashidasu_card.png");
      fs.writeFileSync(pngPath, "dummy png content", "binary");
      
      const result = await cardService.getCardFiles();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードファイルステータスが正常に取得されました");
      expect(result.data.pdfExists).toBe(false);
      expect(result.data.pngExists).toBe(true);
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      expect(result.data.pngPath).toBe("/pdf/kashidasu_card.png");
    });

    test("両方のファイルが存在する場合に正しいステータスを返す", async () => {
      // PDFファイルを作成
      const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
      cardService.createDummyPdf(pdfPath);
      
      // PNGファイルを作成
      const pngPath = path.join(testOutputDir, "kashidasu_card.png");
      fs.writeFileSync(pngPath, "dummy png content", "binary");
      
      const result = await cardService.getCardFiles();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードファイルステータスが正常に取得されました");
      expect(result.data.pdfExists).toBe(true);
      expect(result.data.pngExists).toBe(true);
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      expect(result.data.pngPath).toBe("/pdf/kashidasu_card.png");
    });

    test("ディレクトリが存在しない場合にエラーを投げない", async () => {
      // ディレクトリが存在しないことを確認
      expect(fs.existsSync(testOutputDir)).toBe(false);
      
      // エラーが投げられないことを確認
      const result = await cardService.getCardFiles();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードファイルが存在しません");
    });
  });

  describe("統合テスト", () => {
    test("カード生成からファイル確認までのフローが正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // 1. 初期状態の確認
      let result = await cardService.getCardFiles();
      expect(result.data.pdfExists).toBe(false);
      expect(result.data.pngExists).toBe(false);
      
      // 2. カード生成
      result = await cardService.generateCard(cardData);
      expect(result.success).toBe(true);
      
      // 3. 生成後のファイル確認
      result = await cardService.getCardFiles();
      expect(result.data.pdfExists).toBe(true);
      expect(result.data.pngExists).toBe(false);
      expect(result.message).toBe("カードファイルステータスが正常に取得されました");
      
      // 4. PNGファイルを追加
      const pngPath = path.join(testOutputDir, "kashidasu_card.png");
      fs.writeFileSync(pngPath, "dummy png content", "binary");
      
      // 5. 両方のファイルが存在することを確認
      result = await cardService.getCardFiles();
      expect(result.data.pdfExists).toBe(true);
      expect(result.data.pngExists).toBe(true);
    });

    test("複数回のカード生成が正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // 複数回生成
      for (let i = 0; i < 3; i++) {
        const result = await cardService.generateCard(cardData);
        expect(result.success).toBe(true);
        expect(result.message).toBe("カードが正常に生成されました");
        
        // ファイルが存在することを確認
        const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
        expect(fs.existsSync(pdfPath)).toBe(true);
      }
    });

    test("異なるカードデータで生成が正しく動作する", async () => {
      const cardDataList = [
        {
          id: "1234567890",
          gread: "1年生",
          class: "A組",
          number: "01"
        },
        {
          id: "0987654321",
          gread: "2年生",
          class: "B組",
          number: "15"
        },
        {
          id: "1111111111",
          gread: "3年生",
          class: "C組",
          number: "20"
        }
      ];
      
      for (const cardData of cardDataList) {
        const result = await cardService.generateCard(cardData);
        expect(result.success).toBe(true);
        
        // ファイルが存在することを確認
        const pdfPath = path.join(testOutputDir, "kashidasu_card.pdf");
        expect(fs.existsSync(pdfPath)).toBe(true);
        
        // 各データでエラーが発生しないことを確認
        expect(result.message).toBe("カードが正常に生成されました");
      }
    });

    test("パスの解決が正しく動作する", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      const result = await cardService.generateCard(cardData);
      
      expect(result.success).toBe(true);
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
      
      // 実際のファイルパスが正しいことを確認
      const expectedPath = path.join(testOutputDir, "kashidasu_card.pdf");
      expect(fs.existsSync(expectedPath)).toBe(true);
    });
  });

  describe("サービス層としての特性", () => {
    test("ビジネスロジックのカプセル化", async () => {
      const cardData = {
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // サービス層がビジネスロジックを処理することを確認
      const result = await cardService.generateCard(cardData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("カードが正常に生成されました");
      expect(result.data).toHaveProperty("pdfPath");
      
      // 返されるパスがWebアクセス可能な形式であることを確認
      expect(result.data.pdfPath).toBe("/pdf/kashidasu_card.pdf");
    });

    test("エラーハンドリングの一貫性", async () => {
      const invalidCardData = {
        id: "",
        gread: "1年生",
        class: "A組",
        number: "01"
      };
      
      // サービス層が一貫したエラーメッセージを返すことを確認
      await expect(cardService.generateCard(invalidCardData))
        .rejects.toThrow("すべてのフィールドを入力してください");
    });

    test("状態管理の適切性", async () => {
      // サービスが状態を管理することを確認
      const result1 = await cardService.getCardFiles();
      expect(result1.data.pdfExists).toBe(false);
      
      // カード生成
      await cardService.generateCard({
        id: "1234567890",
        gread: "1年生",
        class: "A組",
        number: "01"
      });
      
      // 状態が更新されたことを確認
      const result2 = await cardService.getCardFiles();
      expect(result2.data.pdfExists).toBe(true);
    });
  });
});
