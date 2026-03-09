/**
 * カードモデル
 * カード生成とファイル管理を管理する
 */
const fs = require("fs");
const path = require("path");

class CardModel {
  /**
   * コンストラクタ
   */
  constructor() {
    this.outputDir = path.join(__dirname, "../../public/pdf");
    // ディレクトリは必要時にのみ作成するため、ここでは自動作成しない
  }

  /**
   * 出力ディレクトリを確保する関数
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * カードを生成する関数
   * @param {object} cardData - カードデータ
   * @param {string} cardData.id - ID
   * @param {string} cardData.gread - 学年
   * @param {string} cardData.class - クラス
   * @param {string} cardData.number - 番号
   * @returns {Promise<object>} - 生成結果
   */
  async generateCard(cardData) {
    try {
      const { id, gread, class: className, number } = cardData;

      // カード情報を検証
      if (!id || !gread || !className || !number) {
        throw new Error("すべてのフィールドを入力してください");
      }

      // 必要時にのみディレクトリを作成
      this.ensureOutputDir();

      // PDF生成（ここでは簡単な実装）
      const pdfPath = path.join(this.outputDir, "kashidasu_card.pdf");

      // 実際のプロジェクトではpuppeteerなどのライブラリを使用してPDFを生成
      // ここではダミーのPDFファイルを作成
      this.createDummyPdf(pdfPath);

      return {
        success: true,
        data: { pdfPath: "/pdf/kashidasu_card.pdf" },
        message: "カードが正常に生成されました",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ダミーPDFを作成する関数
   * @param {string} pdfPath - PDFファイルパス
   */
  createDummyPdf(pdfPath) {
    // ダミーのPDFファイルを作成
    // 実際のプロジェクトではpuppeteerなどのライブラリを使用
    const dummyContent =
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(学生証カード) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000274 00000 n\n0000000369 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n456\n%%EOF";

    fs.writeFileSync(pdfPath, dummyContent, "binary");
  }

  /**
   * カードファイルのステータスを取得する関数
   * @returns {Promise<object>} - ファイルステータス
   */
  async getCardFiles() {
    try {
      // ディレクトリが存在しない場合は空のステータスを返す
      if (!fs.existsSync(this.outputDir)) {
        return {
          success: true,
          data: {
            pdfExists: false,
            pngExists: false,
            pdfPath: "/pdf/kashidasu_card.pdf",
            pngPath: "/pdf/kashidasu_card.png",
          },
          message: "カードファイルが存在しません",
        };
      }

      const pdfPath = path.join(this.outputDir, "kashidasu_card.pdf");
      const pngPath = path.join(this.outputDir, "kashidasu_card.png");

      return {
        success: true,
        data: {
          pdfExists: fs.existsSync(pdfPath),
          pngExists: fs.existsSync(pngPath),
          pdfPath: "/pdf/kashidasu_card.pdf",
          pngPath: "/pdf/kashidasu_card.png",
        },
        message: "カードファイルステータスが正常に取得されました",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CardModel;
