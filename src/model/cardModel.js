const fs = require("fs");
const path = require("path");

class CardModel {
  constructor() {
    this.outputDir = path.join(__dirname, "../../public/pdf");
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateCard(cardData) {
    const { id, gread, class: className, number } = cardData;

    // カード情報を検証
    if (!id || !gread || !className || !number) {
      throw new Error("すべてのフィールドを入力してください");
    }

    // PDF生成（ここでは簡単な実装）
    const pdfPath = path.join(this.outputDir, "kashidasu_card.pdf");

    // 実際のプロジェクトではpuppeteerなどのライブラリを使用してPDFを生成
    // ここではダミーのPDFファイルを作成
    this.createDummyPdf(pdfPath);

    return {
      success: true,
      pdfPath: "/pdf/kashidasu_card.pdf",
    };
  }

  createDummyPdf(pdfPath) {
    // ダミーのPDFファイルを作成
    // 実際のプロジェクトではpuppeteerなどのライブラリを使用
    const dummyContent =
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(学生証カード) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000274 00000 n\n0000000369 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n456\n%%EOF";

    fs.writeFileSync(pdfPath, dummyContent, "binary");
  }

  async getCardFiles() {
    const pdfPath = path.join(this.outputDir, "kashidasu_card.pdf");
    const pngPath = path.join(this.outputDir, "kashidasu_card.png");

    return {
      pdfExists: fs.existsSync(pdfPath),
      pngExists: fs.existsSync(pngPath),
      pdfPath: "/pdf/kashidasu_card.pdf",
      pngPath: "/pdf/kashidasu_card.png",
    };
  }
}

module.exports = CardModel;
