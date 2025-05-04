alert('本の裏にあるISBNコード(上部)をスキャンしてください')

function InitQuagga() {
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive')
        },
        decoder: {
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
        const json = await response.json();
        console.log(json);
        alert('本が正常に登録されました。');
        location.reload();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('本の登録中にエラーが発生しました。');
        location.reload();
    });
}