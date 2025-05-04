let userBarcode = null;
let bookBarcode = null;
let userCodeReaded = false;
let readMode = 'lend';
const setModeBtn = '#set-mode-btn';

const LendModeButton = '/images/LendButtonImage.png';
const ReturnModeButton = '/images/ReturnButtonImage.png';

window.addEventListener('load', async () => {
    RequestCameraPermission();
    
    alert('ユーザーカードを読み込んでください')
});

function SetReadMode() {
    if ($(setModeBtn).attr('class') === 'lend') {
        SetReturnMode();
    } else {
        SetLendMode();
    }
}

function SetLendMode() {
    $(setModeBtn).attr('src', LendModeButton);
    $(setModeBtn).attr('class', 'lend');

    readMode = 'lend';
    alert('貸出モードになりました');
}

function SetReturnMode() {
    $(setModeBtn).attr('src', ReturnModeButton);
    $(setModeBtn).attr('class', 'return');

    readMode = 'return';
    alert('返却モードになりました');
}

async function RequestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        StopStream(stream);
    } catch (error) {
        alert('カメラの許可が必要です。設定を確認してください');
        return;
    }
    InitQuagga('code_128_reader');
}

function StopStream(stream) {
    stream.getTracks().forEach((track) => track.stop());
}

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
        Quagga.start();
    });

    Quagga.onDetected((result) => {
        if (result.codeResult.code) {
            Quagga.stop();
            Detected(result.codeResult.code);
        }
    });
}

async function Detected(result) {
    if (!userCodeReaded) {
        userBarcode = result;
        userCodeReaded = true;

        alert('ユーザーカードのバーコードが読み取られました。\n2秒後に本のバーコードの読み取りを開始します。');

        setTimeout(() => {
            InitQuagga('ean_reader');
            alert('本のバーコードを読み取ってください');
        }, 2000);
    } else {
        bookBarcode = result;
        SendData(userBarcode, bookBarcode);
    }
}

function SendData(userBarcode, bookBarcode) {
    const data = {
        book_id: bookBarcode,
        user_id: userBarcode
    };
    const endpoint = readMode === 'lend' ? '/lend' : '/return';

    if (SendData.isSending) return; // 二重送信を防止
    SendData.isSending = true;

    $.ajax({
        url: endpoint,
        type: 'POST',
        data: data,
        success: function(result) {
            console.dir(result);
            alert('本のバーコードも読み取られました');
        },
        error: function(xhr, status, error) {
            console.error('JSONパースエラー:', error);
        }
    })
    .done(function(result) {

        if (result.result === 'SUCCESS' && readMode == 'lend') alert('正常に貸出が完了しました');
        else if (result.result === 'FAILED' && result.message == 'BOOK_ALRADY_LENDING') alert('エラー: この本はすでに貸出中です\n先に返却してください');
        
        if (result.result == 'SUCCESS' && readMode == 'return') alert('正常に返却が完了しました');
        else if (result.result == 'FAILED' && result.message == 'BOOK_NOT_EXIST') alert('エラー: この本は存在しません\n正常に読み込まれていないか、本が登録されていません\n読み取られたISBNコード: ' + result.requested_data);
        
        // location.reload();

    })
    .always(() => {
        SendData.isSending = false; // リクエスト完了後に解除
    });
}
SendData.isSending = false; // フラグを初期化
