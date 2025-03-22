//リファクタリング済み

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

const OUTPUT_DIR = '/usr/app/src/public/pdf';
const BARCODE_OUTPUT_PATH = path.join(OUTPUT_DIR, 'card_barcode.png');

function EnsureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function GenerateBarcode(studentID) {
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

    EnsureDirectoryExists(OUTPUT_DIR);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(BARCODE_OUTPUT_PATH, buffer);
    
    return BARCODE_OUTPUT_PATH;
  } catch (error) {
    console.error('バーコード生成中にエラーが発生:', error);
    throw error;
  }
}

app.GeneratingBarcode = async (req, res) => {
  try {
    let reqestBody = req.body;
    GeneratingPDF
    studentID = reqestBody.id;
    studentGread = reqestBody.gread;
    studentClass = reqestBody.class;
    studentNumber = reqestBody.number;

    await GeneratingPDF(res);
  } catch (error) {
    console.error('リクエスト処理中にエラーが発生:', error);
    res.status(500).send({ error: 'PDF生成中にエラーが発生しました' });
  }
}

module.exports = app;

async function GeneratingPDF(res) {
  async function createPdf(outputPath, outputDir) {
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
  
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage([width, height]);
  
      const boldFontPath = path.join(__dirname, '../public/fonts/MPLUSRounded1c-bold.ttf');
      const boldFontBytes = await fs.promises.readFile(boldFontPath);
      const boldFontFamily = await pdfDoc.embedFont(boldFontBytes);
  
      const lightFontPath = path.join(__dirname, '../public/fonts/MPLUSRounded1c-light.ttf');
      const lightFontBytes = await fs.promises.readFile(lightFontPath);
      const lightFontFamily = await pdfDoc.embedFont(lightFontBytes);

      const barcodePath = GenerateBarcode(studentID);
      const barcodeBytes = await fs.promises.readFile(barcodePath);
      const barcodeImage = await pdfDoc.embedPng(barcodeBytes);
  
      const barcodeDims = barcodeImage.scale(1);
  
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
        saveFilename: "output_card_image",
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
    const pdfOutputPath = path.resolve('/usr/app/src/public/pdf/output_card.pdf');
    const pngOutputDir = path.resolve('/usr/app/src/public/pdf/');

    const pdfCreated = await createPdf(pdfOutputPath, pngOutputDir);
    if (!pdfCreated) {
      throw new Error('PDF生成に失敗しました');
    }

    await convertPdfToPng(pdfOutputPath, pngOutputDir);
    res.status(200).send({ id: 'Complete'});
  } catch (error) {
    console.error('処理中にエラーが発生:', error);
    res.status(500).send({ error: 'PDF生成中にエラーが発生しました' });
  }
}