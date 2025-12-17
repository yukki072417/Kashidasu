const express = require('express');
const router = express.Router();
const bookController = require('../controller/bookController');

router.post('/register', bookController.createAdmin);
router.get('/get', bookController.getAdmin);
router.update('/update', bookController.updateAdmin);
router.delete('/delete', bookController.delteAdmin);