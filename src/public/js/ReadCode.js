let userBarcode = null;
let bookBarcode = null;
let userCodeReaded = false;
let readMode = 'lend';
let manualInputValue;
const setModeBtn = '#set-mode-btn';

const LendModeButton = '/images/LendButtonImage.png';
const ReturnModeButton = '/images/ReturnButtonImage.png';

window.addEventListener('load', async () => {
    RequestCameraPermission();
    InitManualBarcodeReader();  // ← 手入力機能を初期化
    alert('ユーザーカードを読み込んでください');
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
        if (result.result === 'SUCCESS' && readMode === 'lend') {
            alert('正常に貸出が完了しました');
        } else if (result.result === 'FAILED' && result.message === 'BOOK_ALRADY_LENDING') {
            alert('エラー: この本はすでに貸出中です\n先に返却してください');
        }

        if (result.result === 'SUCCESS' && readMode === 'return') {
            alert('正常に返却が完了しました');
        } else if (result.result === 'FAILED' && result.message === 'BOOK_NOT_EXIST') {
            alert('エラー: この本は存在しません\n正常に読み込まれていないか、本が登録されていません\n読み取られたISBNコード: ' + result.requested_data);
        }
    })
    .always(() => {
        SendData.isSending = false; // フラグ解除
    });
}
SendData.isSending = false;

// -----------------------------
// ▼ 手入力バーコード対応処理 ▼
// -----------------------------
function InitManualBarcodeReader() {
    const $input = $('#hidden-barcode-input');

    // 自動でフォーカス（ページ読み込み時 & 任意のクリック時）
    $(window).on('load', () => $input.focus());
    $(document).on('click', () => $input.focus());

    // 入力イベント（半角英数字のみ許可、全角→半角自動変換）
    $input.on('input', () => {
        let rawValue = $input.val();

        // 全角英数字→半角に変換
        const halfWidthValue = rawValue.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        );

        // 半角英数字以外を除去
        const cleanedValue = halfWidthValue.replace(/[^0-9a-zA-Z]/g, '');

        $input.val(cleanedValue); // 入力内容を置き換え

        // 10桁（ユーザーカード） or 13桁（本のバーコード）を検出
        if (!userCodeReaded && cleanedValue.length === 10) {
            manualInputValue = cleanedValue;
            console.log('手入力: ユーザーカード', manualInputValue);
            DetectedManual(manualInputValue);
            $input.val('');
            setTimeout(() => $input.focus(), 100);
        } else if (userCodeReaded && cleanedValue.length === 13) {
            manualInputValue = cleanedValue;
            console.log('手入力: 本のバーコード', manualInputValue);
            DetectedManual(manualInputValue);
            $input.val('');
            setTimeout(() => $input.focus(), 100);
        }
    });
}

function DetectedManual(code) {
    if (!userCodeReaded) {
        userBarcode = code;
        userCodeReaded = true;

        alert('ユーザーカードのコードが入力されました。\n2秒後に本のバーコードの入力をしてください。');
        setTimeout(() => {
            alert('本のコードを入力してください');
        }, 2000);
    } else {
        bookBarcode = code;
        SendData(userBarcode, bookBarcode);
    }
}
