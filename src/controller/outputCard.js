const { PDFDocument, StandardFonts, PDFPage } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const Jsbarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');
const gs = require('gs');
const imageMagick = require('imagemagick');

const width = 400;
const height = 200;

const barcodeW = 50;
const barcodeH = 25;
let studentID;
let studentGread;
let studentClass;
let studentNumber;

// ファイルパスの定数化
const OUTPUT_DIR = '/usr/app/src/public/pdf';
const BARCODE_OUTPUT_PATH = path.join(OUTPUT_DIR, 'barcode.png');

// ディレクトリの存在確認用関数
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function deletePDFFile(dirPath){

  if(fs.existsSync(dirPath)){
    fs.unlinkSync(dirPath);
  }
}

function generateBarcode(studentID) {
  try {
    const canvas = createCanvas(barcodeW, barcodeH);
    
    Jsbarcode(canvas, studentID, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12
    });

    ensureDirectoryExists(OUTPUT_DIR);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(BARCODE_OUTPUT_PATH, buffer);
    
    return BARCODE_OUTPUT_PATH;
  } catch (error) {
    console.error('バーコード生成中にエラーが発生:', error);
    throw error;
  }
}

app.postRequest = async (req, res) => {
  try {
    let reqestBody = req.body;

    studentID = reqestBody.ID;
    studentGread = reqestBody.GREAD;
    studentClass = reqestBody.CLASS;
    studentNumber = reqestBody.NUMBER;

    await generatingPDF(res);
  } catch (error) {
    console.error('リクエスト処理中にエラーが発生:', error);
    res.status(500).send({ error: 'PDF生成中にエラーが発生しました' });
  }
}

module.exports = app;

async function generatingPDF(res) {
  async function createPdf(outputPath, outputDir) {
    try {
      // 出力ディレクトリの存在確認と作成
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 既存のファイルがあれば削除
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
  
      // 新しいPDFファイルを生成
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage([width, height]);
  
      // フォントの読み込み
      const boldFontPath = path.join(__dirname, '../public/fonts/MPLUSRounded1c-bold.ttf');
      const boldFontBytes = await fs.promises.readFile(boldFontPath);
      const boldFontFamily = await pdfDoc.embedFont(boldFontBytes);
  
      const lightFontPath = path.join(__dirname, '../public/fonts/MPLUSRounded1c-light.ttf');
      const lightFontBytes = await fs.promises.readFile(lightFontPath);
      const lightFontFamily = await pdfDoc.embedFont(lightFontBytes);

      const barcodePath = generateBarcode(studentID);
      const barcodeBytes = await fs.promises.readFile(barcodePath);
      const barcodeImage = await pdfDoc.embedPng(barcodeBytes);
  
      // バーコード画像のサイズを取得
      const barcodeDims = barcodeImage.scale(1);
  
      // PDFにテキストを描画
      page.drawText('Kashidasuカード', {
        x: 20,
        y: 160,
        font: boldFontFamily,
        size: 26,
      });
      page.drawText(`id: ${studentID}`, {
        x: 20,
        y: 120,
        font: lightFontFamily,
        size: 20
      });
      page.drawText(`${studentGread}年 ${studentClass}組 ${studentNumber}番`, {
        x: 20,
        y: 80,
        font: lightFontFamily,
        size: 20
      });
      page.drawImage(barcodeImage, {
        x: 180,
        y: 10,
        width: barcodeDims.width,
        height: barcodeDims.height,
      });

  
      const pdfBytes = await pdfDoc.save();
      await fs.promises.writeFile(outputPath, pdfBytes);
      console.log('PDFファイルが正常に生成されました:', outputPath);
      return true;
    } catch (error) {
      console.error('PDF生成中にエラーが発生:', error);
      throw error;
    }
  }
  
  async function convertPdfToPng(pdfPath, outputDir) {
    try {
      const options = {
        density: 300,
        saveFilename: "output_page",
        savePath: outputDir,
        format: "png",
        width: 400,
        height: 200
      };
      
      const convert = fromPath(pdfPath, options);
      await convert.bulk(-1);  // すべてのページを変換
      
    } catch (error) {
      console.error('PNG変換中にエラーが発生しました:', error);
    }
  }
  
  try {
    const pdfOutputPath = path.resolve('/usr/app/src/public/pdf/output.pdf');
    const pngOutputDir = path.resolve('/usr/app/src/public/pdf/');

    const pdfCreated = await createPdf(pdfOutputPath, pngOutputDir);
    if (!pdfCreated) {
      throw new Error('PDF生成に失敗しました');
    }

    await convertPdfToPng(pdfOutputPath, pngOutputDir);
    res.status(200).send({ id: 'Complete' });
  } catch (error) {
    console.error('処理中にエラーが発生:', error);
    res.status(500).send({ error: 'PDF生成中にエラーが発生しました' });
  }
}