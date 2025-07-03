alert('本の裏にあるISBNコード(上部)をスキャンしてください')

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