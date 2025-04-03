const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: process.env.DB_USER,
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

app.Login = async (req, res) => {
    const { admin_id, admin_password } = req.body;
    if(admin_id == null || admin_password == null) res.send([{result: 'FAILED'}]);

    if (!admin_id || !admin_password) {
        return res.send({result: 'FAILED'});
    }

    try {
        const db = await Connect();
        
        const [results] = await db.query(
            'SELECT ID, PASSWORD FROM ADMIN_USER WHERE ID = ?',
            [admin_id]
        );
        await db.end();
        
        const user = results[0];
        
        if (results.length === 0) {
            return res.status(200).send([{result: 'FAILED'}]);
        }
        
        if (admin_id === user.ID && admin_password === user.PASSWORD) {
            req.session.admin_id = admin_id;
            req.session.admin_authed = true;
            
            return res.redirect('/main');
        } else {
            return res.status(200).send([{result: 'FAILED'}]);
        }
        
    } catch (error) {
        console.error('データベースエラー:', error.message);
        return res.status(200).send([{result: 'ERROR', error: error.message}]);
    }
};

module.exports = app;