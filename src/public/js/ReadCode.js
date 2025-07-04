// 状態管理用の変数
let userBarcode = null; // 10桁のバーコード（ユーザーカード）
let isbnBarcode = null; // 13桁のISBNコード（本のバーコード）
let isUserBarcodeRead = false; // ユーザーカードが読み取られたかどうか

/**
 * Quaggaの初期化
 * @param {string} readerType - 使用するバーコードリーダーの種類（code_128_reader または ean_reader）
 */
function initializeQuagga(readerType) {
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive'),
        },
        decoder: {
            readers: [readerType], // 使用するバーコードリーダーを指定
        },
    }, (err) => {
        if (err) {
            console.error('Quagga初期化エラー:', err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected((result) => {
        if (result.codeResult.code) {
            Quagga.offDetected(); // イベントリスナーを一時解除
            handleBarcodeDetected(result.codeResult.code);
        }
    });
}

/**
 * 手入力バーコード処理の初期化
 */
function initializeManualBarcodeReader() {
    const $input = $('<input>', {
        id: 'hidden-barcode-input',
        type: 'text',
        style: 'position: absolute; top: -9999px;', // 非表示にする
    }).appendTo('body');

    // 全てのキー入力を検知してフォーカスを当てる
    $(document).on('keydown', () => {
        $input.focus();
    });

    // 入力イベント（半角英数字のみ許可、全角→半角自動変換）
    $input.on('input', () => {
        const cleanedValue = cleanInputValue($input.val());
        $input.val(cleanedValue); // 入力内容を置き換え

        // 10桁または13桁のバーコードを検出
        if (!isUserBarcodeRead && cleanedValue.length === 10) {
            console.log('手入力: ユーザーカード', cleanedValue);
            handleBarcodeDetected(cleanedValue);
            $input.val('');
        } else if (isUserBarcodeRead && cleanedValue.length === 13) {
            console.log('手入力: ISBNコード', cleanedValue);
            handleBarcodeDetected(cleanedValue);
            $input.val('');
        }
    });
}

/**
 * 入力値をクリーンアップ（全角→半角変換、不要な文字を除去）
 * @param {string} value - 入力値
 * @returns {string} クリーンアップされた値
 */
function cleanInputValue(value) {
    // 全角英数字→半角に変換
    const halfWidthValue = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );

    // 半角英数字以外を除去
    return halfWidthValue.replace(/[^0-9a-zA-Z]/g, '');
}

/**
 * バーコード検知時の処理
 * @param {string} resultCode - 検知されたバーコード
 */
function handleBarcodeDetected(resultCode) {
    if (!isUserBarcodeRead && resultCode.length === 10) {
        // 10桁のバーコード（ユーザーカード）を処理
        userBarcode = resultCode;
        isUserBarcodeRead = true;
        alert(`ユーザーカードが読み取られました: ${userBarcode}`);
        console.log(`ユーザーカード: ${userBarcode}`);
        restartQuagga('ean_reader'); // 次はISBNコードを読み取る
    } else if (isUserBarcodeRead && resultCode.length === 13) {
        // 13桁のISBNコードを処理
        isbnBarcode = resultCode;
        alert(`ISBNコードが読み取られました: ${isbnBarcode}`);
        console.log(`ISBNコード: ${isbnBarcode}`);
        registerBook(userBarcode, isbnBarcode); // 本の登録処理を呼び出す
    } else {
        alert('無効なバーコードが読み取られました。再試行してください。');
        restartQuagga(isUserBarcodeRead ? 'ean_reader' : 'code_128_reader'); // 再試行
    }
}

/**
 * Quaggaを再起動して次のバーコードを読み取る
 * @param {string} readerType - 使用するバーコードリーダーの種類
 */
function restartQuagga(readerType) {
    Quagga.stop();
    initializeQuagga(readerType);
}

/**
 * 本の登録処理
 * @param {string} userBarcode - ユーザーカードのバーコード
 * @param {string} isbnBarcode - ISBNコード
 */
function registerBook(userBarcode, isbnBarcode) {
    const data = {
        userBarcode: userBarcode,
        isbnBarcode: isbnBarcode,
    };

    // 本の登録のリクエストを送信
    fetch('/register-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            alert('本が正常に登録されました。');
            location.reload();
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            alert('本の登録中にエラーが発生しました。');
            location.reload();
        });
}

// 初期化処理
initializeQuagga('code_128_reader'); // 最初はユーザーカード（code_128）を読み取る
initializeManualBarcodeReader(); // 手入力バーコード処理を初期化