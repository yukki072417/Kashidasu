const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

router.post('/register', adminController.createAdmin);
router.get('/get', adminController.getAdmin);
router.update('/update', adminController.updateAdmin);
router.delete('/delete', adminController.delteAdmin);