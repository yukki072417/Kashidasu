const express = require('express');
const app = express();

app.UpdateSettings = async (req, res) => {
  console.log(req.body);
  res.send({'result': 'SUCCESS'});
} 
