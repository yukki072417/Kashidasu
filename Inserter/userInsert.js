const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv');

function connect() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'ROOT',
        database: 'KASHIDASU'
    });
}

let result = []

fs.createReadStream('/usr/app/csv/usersData.csv')
  .pipe(csv.parse({ columns: true, trim: true }))
  .on('data', (row) => {
      result.push(row); // 各行をresultに追加
  })
  .on('end', async () => {
    result.forEach(async row => {
        //   console.log(`Student_Number: ${row.Student_Number}, Gread: ${row.Gread}, Class: ${row.Class}`); // GreadとClassをコンソールに出力

          let StudentNumber = row.Student_Number;
          let Gread = row.Gread;
          let Class = row.Class;

        //   console.log(Class);
          const db = await connect();

          db.query(`USE KASHIDASU`);
          db.query(`INSERT INTO USERS(SCHOOL_ID, GREAD, CLASS) VALUES (${StudentNumber}, ${Gread}, ${Class})`);
      });
  });
