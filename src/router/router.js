const express = require('express');
const router = express.Router();

const generate = require('../controller/outputCard');
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

// Routing to login pagew
router.get('/', (req, res) => {
    res.redirect('login');
});

// Generating card
router.post('/generating', (req, res) => {
    generate.GenerateCard(req, res);
});

router.get('/edit', (req, res) => {
    res.render('Edit');
});

router.post('/register-book', (req, res) => {
    registerBook.RegisterBook(req, res);
});

// Routing to register page
router.get('/register', (req, res) => {
    res.render('RegisterBook');
});

//Routing to main page 
router.get('/main', requireAuth, (req, res) => {
    res.render('Main', { resData: { id: req.session.admin_id } });
});

// Routing to reading qrcode page
router.get('/read-code', (req, res) => {
    res.render('ReadCode');
});

// Routing to generaging card page
router.get('/generate-card', requireAuth, (req, res) => {
    res.render('GenerateCard');
});

// Routing to book-view page
router.get('/book-list', (req, res) => {
    res.render('BookList');
});

router.get('/logout', requireAuth, (req, res) => {
    res.clearCookie('connect.sid');
    res.redirect('login');
});

<<<<<<< HEAD
// Routing to Scanning Register page
router.get('/scanning-registration', (req, res) => {
    res.render('Registers/ScanningRegister');
});

// Routing to book-view page
router.get('/collective-registration', (req, res) => {
    res.render('Registers/CollectiveRegister');
});



/// Export module
=======
>>>>>>> 9ce123f5aa2b8d5012f5b8f15e8e6f7dc3239d22
module.exports = router;