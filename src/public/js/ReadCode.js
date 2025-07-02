let userBarcode = null;         // ユーザーカードのバーコード値
let bookBarcode = null;         // 本のバーコード値
let userCodeReaded = false;     // ユーザーカードが読み取られたかどうか
let readMode = 'lend';          // 現在のモード（貸出 or 返却）
const setModeBtn = '#set-mode-btn'; // モード切替ボタンのセレクタ

const LendModeButton = '/images/LendButtonImage.png';     // 貸出モード時のボタン画像
const ReturnModeButton = '/images/ReturnButtonImage.png'; // 返却モード時のボタン画像

// ページ読み込み時の処理
window.addEventListener('load', async () => {
    RequestCameraPermission(); // カメラの利用許可をリクエスト
    alert('ユーザーカードを読み込んでください');
});

// モード切替ボタンが押されたときの処理
function SetReadMode() {
    // 現在のクラスが"lend"なら返却モードへ、そうでなければ貸出モードへ
    if ($(setModeBtn).attr('class') === 'lend') {
        SetReturnMode();
    } else {
        SetLendMode();
    }
}

// 貸出モードに切り替える関数
function SetLendMode() {
    $(setModeBtn).attr('src', LendModeButton); // ボタン画像を貸出用に
    $(setModeBtn).attr('class', 'lend');       // クラスを"lend"に
    readMode = 'lend';                         // モードを貸出に
    alert('貸出モードになりました');
}

// 返却モードに切り替える関数
function SetReturnMode() {
    $(setModeBtn).attr('src', ReturnModeButton); // ボタン画像を返却用に
    $(setModeBtn).attr('class', 'return');       // クラスを"return"に
    readMode = 'return';                         // モードを返却に
    alert('返却モードになりました');
}

// カメラの利用許可をリクエストする関数
async function RequestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        StopStream(stream); // 許可が取れたらすぐにストリームを停止
    } catch (error) {
        alert('カメラの許可が必要です。設定を確認してください');
        return;
    }
    InitQuagga('code_128_reader'); // Quaggaでバーコード読み取り開始
}

// カメラストリームを停止する関数
function StopStream(stream) {
    stream.getTracks().forEach((track) => track.stop());
}

// Quaggaライブラリでバーコード読み取りを初期化する関数
function InitQuagga(readerType) {
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive')
        },
        decoder: {
            readers: [readerType],
        },
    }, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start(); // 読み取り開始
    });

    // バーコードが検出されたときの処理
    Quagga.onDetected((result) => {
        if (result.codeResult.code) {
            Quagga.stop(); // 一旦読み取りを停止
            Detected(result.codeResult.code); // 検出結果を処理
        }
    });
}

// バーコードが検出されたときの処理
async function Detected(result) {
    if (!userCodeReaded) {
        // まだユーザーカードが読み取られていない場合
        userBarcode = result;
        userCodeReaded = true;

        alert('ユーザーカードのバーコードが読み取られました。\n2秒後に本のバーコードの読み取りを開始します。');

        setTimeout(() => {
            InitQuagga('ean_reader'); // 本のバーコード読み取りを開始
            alert('本のバーコードを読み取ってください');
        }, 2000);
    } else {
        // すでにユーザーカードが読み取られている場合は本のバーコードを取得
        bookBarcode = result;
        SendData(userBarcode, bookBarcode); // サーバーに貸出/返却リクエストを送信
    }
}

// サーバーに貸出/返却リクエストを送信する関数
function SendData(userBarcode, bookBarcode) {
    // 送信するデータを作成
    const data = {
        book_id: bookBarcode,
        user_id: userBarcode
    };
    // モードによって送信先URLを切り替え
    const endpoint = readMode === 'lend' ? '/lend' : '/return';

    // 二重送信を防止するためのフラグ
    if (SendData.isSending) return; // すでに送信中なら何もしない
    SendData.isSending = true;      // 送信中フラグを立てる

    // サーバーにPOSTリクエストを送信（jQueryのajaxを使用）
    $.ajax({
        url: endpoint,
        type: 'POST', 
        data: data,   
        success: function(result) {
            // サーバーから正常な応答があった場合の処理
            alert('本のバーコードも読み取られました');
        },
        error: function(xhr, status, error) {
            // 通信エラーやサーバーエラー時の処理
            console.error('JSONパースエラー:', error);
        }
    })
    .done(function(result) {
        // サーバーからの応答内容によってメッセージを表示
        if (result.result === 'SUCCESS' && readMode == 'lend')
            alert('正常に貸出が完了しました');
        else if (result.result === 'FAILED' && result.message == 'BOOK_ALRADY_LENDING')
            alert('エラー: この本はすでに貸出中です\n先に返却してください');
        
        if (result.result == 'SUCCESS' && readMode == 'return')
            alert('正常に返却が完了しました');
        else if (result.result == 'FAILED' && result.message == 'BOOK_NOT_EXIST')
            alert('エラー: この本は存在しません\n正常に読み込まれていないか、本が登録されていません\n読み取られたISBNコード: ' + result.requested_data);
        
        // ページをリロード
        location.reload();
    })
    .always(() => {
        // リクエストが完了したらフラグを解除（二重送信防止をリセット）
        SendData.isSending = false;
    });
}
SendData.isSending = false; // 二重送信防止用のフラグを初期化