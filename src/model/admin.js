const express = require('express');
const app = express();
const mysql = require("mysql2/promise");

// データベース接続関数
app.use(express.json());

app.AdminAuth = async (req, res) => {
    function Connect() {
        return mysql.createConnection({
            host: 'db',
            user: 'root',
            password: process.env.ROOT_PASSWORD,
            database: 'KASHIDASU'
        });
    }

    const db = await Connect()

    try {
        const rows = await db.query(
            'SELECT * FROM ADMIN_USER WHERE ID = ?',
            [req.session.admin_id]
        );
            console.log(rows);
        if(rows.length > 0){
            res.send({'result': 'SUCCESS', 'is_admin': true});
        }else{
            res.send({'result': 'SUCCESS', 'is_admin': false});
        }
    } catch(error) {
        console.log(error);
        console.log("error");
    }
};

module.exports = app;