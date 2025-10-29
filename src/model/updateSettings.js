const express = require('express');
const mysql = require('mysql2/promise');
const { encryptRSA } = require('./registerUser');
const app = express();

function Connect() {
  return mysql.createConnection({
      host: 'db',
      user: "root",
      password: process.env.ROOT_PASSWORD,
      database: 'KASHIDASU'
  });
}

//　現在開発中
app.UpdateSettings = async (req, res) => {
  const db = await Connect();

  const adminID = req.session.admin_id;
  const { last_name, first_name } = req.body;
  try{
    if(last_name == null || first_name == null) throw new Error('BAD_REQUEST');
    
    const query = "UPDATE ADMIN_USER SET FIRST_NAME = ?, LAST_NAME = ? WHERE ID = ?"
    const value = [encryptRSA(first_name), encryptRSA(last_name), adminID];

    const result = await db.query(query, value);
    console.log(req.body);
    
    if(result[0].affectedRows > 0) return res.send({'result': 'SUCCESS'});
    else throw new Error('UPDATE_FAILED');
    
  }catch(error){
    res.send({'result': 'ERROR', 'error': error});
  }finally{
    db.end();
  }
}

module.exports = app;