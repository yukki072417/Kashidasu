const mysql = require("mysql2/promise");

function Connect() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: process.env.ROOT_PASSWORD,
        database: 'KASHIDASU'
    });
}

module.exports = { Connect };