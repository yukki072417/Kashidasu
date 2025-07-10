const express = require('express');
const router = express.Router();

const generate = require('../services/outputCard');
const auth = require('../model/auth');
const serachBook = require('../model/searchBook');
const lendBook = require('../model/lendBook');
const returnBook = require('../model/returnBook');
const updateBook = require('../model/updateBook');
const registerBook = require('../model/registerBook');
const deleteBook = require('../model/deleteBook');
const updateSettings = require('../model/updateSettings');
const registerUser = require('../model/registerUser');

// ミドルウェアを指定
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// ログインページを表示
router.get('/login', (req, res) => {
    //デバッグモード判定
    if(process.env.DEBUG_MODE == 'true'){
      req.session.admin_authed = true
      req.session.admin_id = 'yukki072417'
    }

    // ユーザーがログイン済みの場合の処理
    if (req.session.admin_authed == true) {
        // メインページへリダイレクト
        return res.redirect('/main');
    }
    // ログインページをレンダリング
    res.render('Login');
});

// ユーザーのセッションを確認（auth.jsからインポート）
const requireAuth = auth.requireAuth;

// 管理者追加
router.post('/register-admin', (req, res) => userRegister.registerUser(req, res));

// データベースで書籍を検索
router.post('/search-book', serachBook.SearchBook);

// 書籍を貸し出す
router.post('/lend', lendBook.LendBook);

// 書籍を返却する
router.post('/return', returnBook.ReturnBook);

// ユーザーのログイン処理
router.post('/main', auth.Login);

// 書籍情報を更新する
router.post('/upload-book', updateBook.UploadBook);

// 書籍を削除する
router.post('/delete-book', deleteBook.DeleteBook);

// ログインページへルーティング
router.get('/', (req, res) => {
    res.redirect('login');
});

// カードを生成する
router.post('/generating', (req, res) => {
    generate.GenerateCard(req, res);
});

// 書籍編集ページを表示
router.get('/edit', (req, res) => {
    res.render('EditBook');
});

// 書籍を登録する
router.post('/register-book', (req, res) => {
    registerBook.RegisterBook(req, res);
});

// 書籍登録ページへルーティング
router.get('/register', requireAuth, (req, res) => {
    res.render('Register');
});

// メインページへルーティング（認証＋複合化した名前を渡す）
router.get('/main', requireAuth, auth.renderMainPage);

// QRコード読み取りページへルーティング
router.get('/read-code', (req, res) => {
    res.render('ReadCode');
});

// カード生成ページへルーティング
router.get('/generate-card', requireAuth, (req, res) => {
    res.render('GenerateCard');
});

// 書籍一覧ページへルーティング
router.get('/book-list', (req, res) => {
    res.render('BookList');
});

// ログアウト処理
router.get('/logout', requireAuth, (req, res) => {
    res.clearCookie('connect.sid');
    res.redirect('login');
});

// スキャン登録ページへルーティング
router.get('/scanning-registration', requireAuth, (req, res) => {
    res.render('Registers/ScanningRegister');
});

// 書籍一覧ページへルーティング
router.get('/collective-registration', requireAuth, (req, res) => {
    res.render('Registers/CollectiveRegister');
});

// ユーザー登録エンドポイント
//ここは必ず正式稼働時には、RequireAuthを付け加える
router.post('/register-user', (req, res) => registerUser.RegisterUser(req, res));

// 設定ページへルーティング
router.get('/settings', (req, res) => res.render('Settings'));

// 設定を更新する
router.post('/update-settings', (req, res) => updateSettings.UpdateSettings(req, res));

/// モジュールをエクスポート
module.exports = router;
