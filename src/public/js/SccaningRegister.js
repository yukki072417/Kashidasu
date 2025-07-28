alert('本の裏にあるISBNコード(上部)をスキャンしてください');

// バーコードリーダ初期化
function InitQuagga() {
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive')
        },
        decoder: {
            // ISBNコードのバーコード規格がeanのため、ean_readerで必ず固定
            readers: ['ean_reader'],
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
            Quagga.offDetected(); // イベントリスナーを解除
            Detected(result.codeResult.code);
        }
    });
}
InitQuagga();

// 手入力バーコード処理の初期化
function InitManualBarcodeReader() {
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
        let rawValue = $input.val();

        // 全角英数字→半角に変換
        const halfWidthValue = rawValue.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        );

        // 半角英数字以外を除去
        const cleanedValue = halfWidthValue.replace(/[^0-9a-zA-Z]/g, '');

        $input.val(cleanedValue); // 入力内容を置き換え

        // 13桁（ISBNコード）を検出
        if (cleanedValue.length === 13) {
            console.log('手入力: ISBNコード', cleanedValue);
            Detected(cleanedValue);
            $input.val('');
            setTimeout(() => $input.focus(), 100);
        }
    });
}
InitManualBarcodeReader();

// バーコード検知時の処理
function Detected(resultCode) {
    if (confirm(`ISBNコードは ${resultCode} でよろしいですか？`)) {
        const title = prompt('本のタイトルを入力してください:');
        const author = prompt('著者名を入力してください:');
        if (title && author) {
            RegisterBook(resultCode, title, author);
        } else {
            alert('タイトルと著者名は必須です。');
            location.reload();
        }
    }
    else location.reload();
}

// 本の登録処理
function RegisterBook(isbn, title, author) {
    const data = {
        books: [
            {
                isbn: isbn,
                title: title,
                author: author
            }
        ]
    };

    // 本の登録のリクエストを送信
    fetch('/register-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if(response.body.result == 'BOOK_ALRADY_EXIST') return alert('この本はすでに登録されています')
        const json = await response.json();
        alert('本が正常に登録されました。');
        location.reload();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('本の登録中にエラーが発生しました。');
        location.reload();
    });
}