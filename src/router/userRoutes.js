const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/register', userController.createAdmin);
router.get('/get', userController.getAdmin);
router.update('/update', userController.updateAdmin);
router.delete('/delete', userController.delteAdmin);