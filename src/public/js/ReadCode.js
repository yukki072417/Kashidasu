// 状態管理用の変数
let userBarcode = null; // 10桁のバーコード（ユーザーカード）
let isbnBarcode = null; // 13桁のISBNコード（本のバーコード）
let isUserBarcodeRead = false; // ユーザーカードが読み取られたかどうか
let currentMode = 'lend'; // 'lend' または 'return'

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
            readers: [readerType],
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
            Quagga.offDetected(); // 一時的に検出を停止
            handleBarcodeDetected(result.codeResult.code);
        }
    });
}

/**
 * 手入力バーコード処理の初期化
 */
function initializeManualBarcodeReader() {
    const $input = $('#hidden-barcode-input');

    $(document).on('keydown', () => {
        $input.focus();
    });

    $input.on('input', () => {
        const cleanedValue = cleanInputValue($input.val());
        $input.val(cleanedValue);

        if (!isUserBarcodeRead && cleanedValue.length === 10) {
            handleBarcodeDetected(cleanedValue);
            $input.val('');
        } else if (isUserBarcodeRead && cleanedValue.length === 13) {
            handleBarcodeDetected(cleanedValue);
            $input.val('');
        }
    });
}

/**
 * 入力値をクリーンアップ（全角→半角変換、不要な文字を除去）
 */
function cleanInputValue(value) {
    const halfWidthValue = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
    return halfWidthValue.replace(/[^0-9a-zA-Z]/g, '');
}

/**
 * バーコード検知時の処理
 */
function handleBarcodeDetected(resultCode) {
    if (!isUserBarcodeRead && resultCode.length === 10) {
        userBarcode = resultCode;
        isUserBarcodeRead = true;
        alert(`ユーザーカードが読み取られました: ${userBarcode}`);
        restartQuagga('ean_reader'); // ISBNコードの読み取りへ
    } else if (isUserBarcodeRead && resultCode.length === 13) {
        isbnBarcode = resultCode;
        alert(`ISBNコードが読み取られました: ${isbnBarcode}`);
        processingBook(userBarcode, isbnBarcode);
    } else {
        alert('無効なバーコードが読み取られました。再試行してください。');
        restartQuagga(isUserBarcodeRead ? 'ean_reader' : 'code_128_reader');
    }
}

/**
 * Quaggaを再起動して次のバーコードを読み取る
 */
function restartQuagga(readerType) {
    Quagga.stop();
    initializeQuagga(readerType);
}

/**
 * 本の登録処理
 */
function processingBook(userBarcode, isbnBarcode) {
    console.log('currentMode:', currentMode);
    const data = {
        user_id: userBarcode,
        book_id: isbnBarcode,
    };

    fetch(`/${currentMode}`, {
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
            switch (json.message) {
                case 'BOOK_NOT_EXIST':
                    alert('エラー: 本が存在しません');
                    break;
                case 'BOOK_ALRADY_LENDING':
                    alert('エラー: この本はすでに借りられています');
                    break;
                case 'BOOK_NOT_LENDING':
                    alert('エラー: この本は貸出されていません');
                    break;
                default:
                    alert(`本が正常に${currentMode === 'lend' ? '貸出' : '返却'}されました。`);
            }
            location.reload();
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            alert('本の登録中にエラーが発生しました。');
            location.reload();
        });
}

/**
 * DOMが読み込まれてから初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeQuagga('code_128_reader'); // 最初はユーザーカード
    initializeManualBarcodeReader();     // 手入力処理

    // モード切り替えボタンの処理
    const toggleBtn = document.getElementById('toggle-mode-btn');
    toggleBtn.addEventListener('click', () => {
        currentMode = currentMode === 'lend' ? 'return' : 'lend';
        toggleBtn.textContent = `${currentMode === 'lend' ? '貸出モード' : '返却モード'}`;
    });
});
