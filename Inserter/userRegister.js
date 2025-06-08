const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv');
const path = require('path');

function Connect() {
    return mysql.createConnection({
        host: "db",
        user: process.env.DB_USER,
        password: process.env.ROOT_PASSWORD,
        database: "KASHIDASU",
    });
}

const db = await Connect();