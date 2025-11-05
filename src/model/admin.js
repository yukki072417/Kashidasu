const express = require('express');
const app = express();
const mysql = require("mysql2/promise");
app.use(express.json());

// 図書委員判定
app.AdminAuth = async (req, res) => {

    // データベース接続関数初期化
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: 'root',
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    // データベース接続関数
    const db = await Connect()

    // データベースの接続処理
    try {
        const rows = await db.query(
            'SELECT * FROM ADMIN_USER WHERE ID = ?',
            [req.query.student_id]
        );
        if(rows[0].length > 0){
            // レスポンス成功時返却
            res.send({'result': 'SUCCESS', 'is_admin': true});
        }else{
            // レスポンス失敗時返却
            res.send({'result': 'SUCCESS', 'is_admin': false});
        }
    } catch(error) {
        console.log(error);
        console.log("error");
    }
};

module.exports = app;