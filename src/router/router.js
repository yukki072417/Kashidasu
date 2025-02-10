const express = require('express');
const session = require('express-session');
const router = express.Router();

const genelate = require('../controller/generateCard');
const authModel = require('../model/auth');
const serachBook = require('../model/serachBook');
const lendBook = require('../model/lendBook');
const returnBook = require('../model/returnBook');
const uploadBook = require('../model/uploadBook');
const registerBook = require('../model/registerBook');
const deleteBook = require('../model/deleteBook');

//Specifying someting
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Show login page
router.get('/login', (req, res) => {

    // Process when user logined
    if (req.session.admin_authed == true) {
        // redirect to main page
        return res.redirect('/main');
    }
    // Rendering to login page
    res.render('login');
});

// Sercching book
router.post('/searchBook', serachBook.searchBook);

// Lending book
router.post('/lend', lendBook.lendBook);

// Returning book
router.post('/return', returnBook.returnBook);

// Logining user
router.post('/main', authModel.login);

// Uploading book
router.post('/upload-book', uploadBook.uploadBook);

// Deleting book
router.post('/delete-book', deleteBook.deleteBook);

//Checking user session
const requireAuth = (req, res, next) => {
    if (req.session.admin_authed)
        next();
    else
        res.redirect('/login');
};

// Routing to login page
router.get('/', (req, res) => {
    res.redirect('login');
});

// Generating card
router.post('/generating', (req, res) => {
    genelate.postRequest(req, res);
});

router.get('/edit', (req, res) => {
    res.render('edit');
});

router.post('/register-book', (req, res) => {
    registerBook.registerBook(req, res);
});

// Routing to register page
router.get('/register', (req, res) => {
    res.render('registerBook');
});

//Routing to main page 
router.get('/main', requireAuth, (req, res) => {
    res.render('main', { resData: { id: req.session.admin_id } });
});

// Routing to reading qrcode page
router.get('/read-qr', requireAuth, (req, res) => {
    res.render('read-qr');
});

// Routing to generaging card page
router.get('/genelate-card', requireAuth, (req, res) => {
    res.render('genelateCard');
});

// Routing to book-view page
router.get('/book-view', (req, res) => {
    res.render('bookView');
});

// Processing when logout
router.get('/logout', requireAuth, (req, res) => {
    res.clearCookie('connect.sid');
    res.redirect('login');
});

/// Export module
module.exports = router;