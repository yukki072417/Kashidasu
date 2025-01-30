const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

function connect() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'ROOT',
        database: 'KASHIDASU'
    });
}

app.login = async (req, res) => {
    const { admin_id, admin_password } = req.body;

    if (!admin_id || !admin_password) {
        return res.send('wrong');
    }

    try {
        const db = await connect();
        
        const [results] = await db.query(
            'SELECT ID, PASSWORD FROM ADMIN_USER WHERE ID = ?',
            [admin_id]
        );

        await db.end();

       // Processesing when the user does not exist.
        if (results.length === 0) {
            return res.send('WRONG');
        }

        const user = results[0];

        // パスワード照合
        if (admin_id === user.ID && admin_password === user.PASSWORD) {
            req.session.admin_id = admin_id;
            req.session.admin_authed = true;
            
            return res.redirect('/main');
        } else {
            return res.send('wrong');
        }

    } catch (error) {
        console.error('データベースエラー:', error);
        return res.send('error')
    }
};

module.exports = app;