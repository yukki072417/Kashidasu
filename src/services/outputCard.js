/**
 * カード出力サービス
 * 学生証カードのPDF生成を管理する
 */
const { PDFDocument } = require("pdf-lib");
const bwipjs = require("bwip-js");
const fs = require("fs");
const path = require("path");
const fontkit = require("@pdf-lib/fontkit");

const width = 400; // カードの幅（ピクセル）
const height = 200; // カードの高さ（ピクセル）
const OUTPUT_DIR = path.join(__dirname, "../public/pdf"); // 出力ディレクトリ（相対パス）

/**
 * ディレクトリが存在することを確認する関数
 * @param {string} dirPath - ディレクトリパス
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * バーコードを生成する関数
 * @param {string} studentID - 学生ID
 * @returns {Promise<string>} - バーコードファイルパス
 */
async function generateBarcode(studentID) {
  ensureDirectoryExists(OUTPUT_DIR);
  const barcodePath = path.join(OUTPUT_DIR, `card_barcode_${studentID}.png`);

  try {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: studentID,
      scale: 2,
      height: 10,
      includetext: true,
      textxalign: "center",
      textsize: 13,
    });

    fs.writeFileSync(barcodePath, pngBuffer);
    return barcodePath;
  } catch (error) {
    console.error("バーコード生成中にエラーが発生:", error);
    throw error;
  }
}

/**
 * PDFを作成する関数
 * @param {string} outputPath - 出力ファイルパス
 * @param {object} studentData - 学生データ
 * @param {string} studentData.id - 学生ID
 * @param {string} studentData.gread - 学年
 * @param {string} studentData.class - クラス
 * @param {string} studentData.number - 番号
 * @returns {Promise<boolean>} - 作成成功フラグ
 */
async function createPdf(outputPath, studentData) {
  try {
    ensureDirectoryExists(path.dirname(outputPath));
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([width, height]);

    const boldFontPath = path.join(
      __dirname,
      "../public/fonts/MPLUSRounded1c-Bold.ttf",
    );
    const boldFontBytes = await fs.promises.readFile(boldFontPath);
    const boldFontFamily = await pdfDoc.embedFont(boldFontBytes);

    const lightFontPath = path.join(
      __dirname,
      "../public/fonts/MPLUSRounded1c-Light.ttf",
    );
    const lightFontBytes = await fs.promises.readFile(lightFontPath);
    const lightFontFamily = await pdfDoc.embedFont(lightFontBytes);

    const barcodePath = await generateBarcode(studentData.id);
    const barcodeBytes = await fs.promises.readFile(barcodePath);
    const barcodeImage = await pdfDoc.embedPng(barcodeBytes);
    const barcodeDims = barcodeImage.scale(1);

    page.drawText("Kashidasuカード", {
      x: 20,
      y: 160,
      font: boldFontFamily,
      size: 26,
    });
    page.drawText(`id: ${studentData.id}`, {
      x: 20,
      y: 120,
      font: lightFontFamily,
      size: 20,
    });
    page.drawText(
      `${studentData.gread}年 ${studentData.class}組 ${studentData.number}番`,
      {
        x: 20,
        y: 80,
        font: lightFontFamily,
        size: 20,
      },
    );
    page.drawImage(barcodeImage, {
      x: 180,
      y: 10,
      width: barcodeDims.width,
      height: barcodeDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, pdfBytes);
    return true;
  } catch (error) {
    console.error("PDF生成中にエラーが発生:", error);
    throw error;
  }
}

/**
 * カード生成リクエストを処理する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 */
async function generateCard(req, res) {
  try {
    const studentData = req.body;
    const pdfFilename = `kashidasu_card.pdf`;
    const pdfOutputPath = path.join(OUTPUT_DIR, pdfFilename);

    const pdfCreated = await createPdf(pdfOutputPath, studentData);
    if (!pdfCreated) {
      throw new Error("PDF生成に失敗しました");
    }

    res.status(200).json({
      success: true,
      data: { id: "Complete" },
      message: "カードが正常に生成されました",
    });
  } catch (error) {
    console.error("リクエスト処理中にエラーが発生:", error);
    res
      .status(500)
      .json({ success: false, message: "PDF生成中にエラーが発生しました" });
  }
}

module.exports = {
  generateCard,
  createPdf,
  generateBarcode,
};
