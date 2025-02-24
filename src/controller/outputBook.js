// const express = require('express')
// const app = express();

// const Jsbarcode = require('jsbarcode');
// const { createCanvas } = require('canvas');

// const fs = require('fs');
// const path = require('path');

// const width = 300;
// const height = 150;

// const barcodeW = 50;
// const barcodeH = 25;

// const OUTPUT_DIR = '/usr/app/src/public/pdf';
// const BARCODE_OUTPUT_PATH = path.join(OUTPUT_DIR, 'book_barcode.png');

// app.OutputBarcode = (req, res) => {
//     try {
//         const reqestBody = req.body;
//         const bookID = reqestBody.ID;
//         console.log(reqestBody);
//         res.send("HELLO");

//     } catch (error) {

//     }
// }

// function GenerateBarcode(bookID) {
//   try {
//     const canvas = createCanvas(barcodeW, barcodeH);
    
//     Jsbarcode(canvas, bookID, {
//       format: "CODE128",
//       lineColor: "#000",
//       width: 2,
//       height: 50,
//       displayValue: true,
//       fontSize: 12
//     });

//     ensureDirectoryExists(OUTPUT_DIR);
//     const buffer = canvas.toBuffer('image/png');
//     fs.writeFileSync(BARCODE_OUTPUT_PATH, buffer);
    
//     // return BARCODE_OUTPUT_PATH;
//   } catch (error) {
//     console.error('バーコード生成中にエラーが発生:', error);
//     throw error;
//   }
// }

// export default app;