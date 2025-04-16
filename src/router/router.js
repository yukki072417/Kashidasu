const express = require('express');
const router = express.Router();

const genelate = require('../controller/outputCard');
const auth = require('../model/auth');
const serachBook = require('../model/serachBook');
const lendBook = require('../model/lendBook');
const returnBook = require('../model/returnBook');
const uploadBook = require('../model/uploadBook');
const registerBook = require('../model/registerBook');
const deleteBook = require('../model/deleteBook');
const searchBookOfISBN = require('../controller/searchBookOfISBN');
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

//Checking user session
const requireAuth = (req, res, next) => {
    if (req.session.admin_authed)
        next();
    else
        res.redirect('/login');
};

// Searching book to DB
router.post('/search-book', serachBook.SearchBook);

// Seaching book of ISBN
router.post('/search-book-isbn', searchBookOfISBN.SearchBookOfISBN);

// Lending book
router.post('/lend', lendBook.LendBook);

// Returning book
router.post('/return', returnBook.ReturnBook);

// Logining user
router.post('/main', auth.Login);

// Uploading book
router.post('/upload-book', uploadBook.UploadBook);

// Deleting book
router.post('/delete-book', deleteBook.DeleteBook);

// Routing to login page
router.get('/', (req, res) => {
    res.redirect('login');
});

// Generating card
router.post('/generating', (req, res) => {
    genelate.GeneratingBarcode(req, res);
});

router.get('/edit', (req, res) => {
    res.render('edit');
});

router.post('/register-book', (req, res) => {
    registerBook.RegisterBook(req, res);
});

// Routing to register page
router.get('/register', (req, res) => {
    res.render('registerBook');
});

//Routing to main page 
router.get('/main', requireAuth, (req, res) => {
    res.render('main', { resData: { id: req.session.admin_id } });
});

router.get('/read-qr', (req, res) => {
    res.render('readCode');
});

router.get('/genelate-card', requireAuth, (req, res) => {
    res.render('genelateCard');
});

router.get('/book-view', (req, res) => {
    res.render('bookView');
});

router.get('/logout', requireAuth, (req, res) => {
    res.clearCookie('connect.sid');
    res.redirect('login');
});

module.exports = router;