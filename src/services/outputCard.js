const PImage = require('pureimage');
const fs = require('fs');
const path = require('path');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas'); // JsBarcode 用

const width = 400;
const height = 200;
const OUTPUT_DIR = '/usr/app/src/public/pdf';
const PNG_OUTPUT_PATH = path.join(OUTPUT_DIR, 'kashidasu_card.png');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function generateCardImage(studentData) {
  try {
    ensureDirectoryExists(OUTPUT_DIR);

    const img = PImage.make(width, height);
    const ctx = img.getContext('2d');

    // 背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // テキスト
    ctx.fillStyle = 'black';
    ctx.font = '26pt Arial';
    ctx.fillText('Kashidasuカード', 20, 40);
    ctx.font = '20pt Arial';
    ctx.fillText(`id: ${studentData.id}`, 20, 80);
    ctx.fillText(`${studentData.gread}年 ${studentData.class}組 ${studentData.number}番`, 20, 120);

    // バーコード生成（canvas を使って PNG にして貼り付け）
    const barcodeCanvas = createCanvas(180, 50);
    JsBarcode(barcodeCanvas, studentData.id, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12
    });

    const barcodeBuffer = barcodeCanvas.toBuffer('image/png');
    const barcodeImg = await PImage.decodePNGFromStream(fs.createReadStream(
      await saveTempBarcode(barcodeBuffer)
    ));
    ctx.drawImage(barcodeImg, 180, 130);

    // PNG 保存
    const out = fs.createWriteStream(PNG_OUTPUT_PATH);
    await PImage.encodePNGToStream(img, out);

    return PNG_OUTPUT_PATH;
  } catch (error) {
    console.error('PNG生成中にエラーが発生:', error);
    throw error;
  }
}

async function saveTempBarcode(buffer) {
  const tempPath = path.join(OUTPUT_DIR, 'temp_barcode.png');
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}
