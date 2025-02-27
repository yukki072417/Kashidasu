const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv');
const path = require('path');

function connect() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'ROOT',
        database: 'KASHIDASU'
    });
}

let result = []

const csvPath = path.join(__dirname, '../csv/booksData.csv');

fs.createReadStream(csvPath)
    .pipe(csv.parse({ columns: true, trim: true }))
    .on('data', (row) => {
        result.push(row);
    })
    .on('end', async () => {
        result.forEach(async row => {

            const db = await connect();

            let id = row.id;
            let bookName = row.book_name;
            let writter = row.writter

            console.log(bookName);

            try {
                await db.query(`USE KASHIDASU`);
                await db.query(`SET NAMES 'utf8mb4'`);
                await db.query(`INSERT INTO BOOKS(ID, BOOK_NAME, WRITTER) VALUES ("${id}", "${bookName}", "${writter}")`);
            } catch (error) {
                console.error(error);
            } finally {
                db.end();
            }

        });
    })
    .on('error', (error) => {
        console.error('ファイル読み込みエラー:', error);
    });
