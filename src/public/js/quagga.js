let userBarcode = null;
let bookBarcode = null;
let userCodeReaded = false;
let readMode = 'lend';
const setModeBtn = "#set-mode-btn";

const LendModeButton = "/images/LendButtonImage.png";
const ReturnModeButton = "/images/ReturnButtonImage.png";

window.addEventListener("load", async () => {
    requestCameraPermission();
});

function setReadMode() {
    if ($(setModeBtn).attr("class") === "lend") {
        setReturnMode();
    } else {
        setLendMode();
    }
}

function setLendMode() {
    $(setModeBtn).attr("src", LendModeButton);
    $(setModeBtn).attr("class", "lend");

    readMode = "lend";
    alert("貸出モードになりました");
}

function setReturnMode() {
    $(setModeBtn).attr("src", ReturnModeButton);
    $(setModeBtn).attr("class", "return");

    readMode = "return";
    alert("返却モードになりました");
}

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stopStream(stream);
    } catch (error) {
        alert("カメラの許可が必要です。設定を確認してください。");
        return;
    }
    initQuagga();
}

function stopStream(stream) {
    stream.getTracks().forEach((track) => track.stop());
}

function initQuagga() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#interactive"),
        },
        decoder: {
            readers: ["code_128_reader"],
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
            Quagga.stop(); // バーコードが検出されたらQuaggaを停止
            detected(result.codeResult.code);
        }
    });
}

async function detected(result) {
    if (!userCodeReaded) {
        userBarcode = result;
        userCodeReaded = true;

        alert("ユーザーカードのバーコードが読み取られました。\n2秒後に本のバーコードの読み取りを開始します。");

        setTimeout(() => {
            initQuagga();
            alert("本のバーコードを読み取ってください");
        }, 2000);
    } else {
        bookBarcode = result;

        const response = await searchingExiestData(bookBarcode);
        if (response === 'NOT_EXIST_BOOK') {
            alert('存在しない本のIDです。もう一度お試しください');
        } else {
            sendData(userBarcode, bookBarcode);
            alert("本のバーコードも読み取られました");
        }
    }
}

async function searchingExiestData(id) {
    const data = {
        bookID: id,
        bookNum: 1,
        manualSearchMode: true
    };

    try {
        const response = await $.ajax({
            url: '/searchBook',
            type: 'POST',
            headers: {
                'CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            contentType: 'application/json',
            data: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        console.error('エラー:', error);
        throw error;
    }
}

function sendData(userBarcode, bookBarcode) {
    const data = {
        userCode: userBarcode,
        bookCode: bookBarcode,
    };

    const endpoint = readMode === 'lend' ? '/lend' : '/return';

    $.ajax({
        url: endpoint,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json'
    });
}

function sendForm() {
    const studentId = document.getElementById('studentId').value;
    const gread = document.getElementById('gread').value;
    const className = document.getElementById('class').value;
    const number = document.getElementById('number').value;

    if (!studentId || !gread || !className || !number) {
        alert('すべてのフィールドを入力してください');
        return;
    }

    const datas = {
        studentId: studentId,
        gread: gread,
        class: className,
        number: number
    };

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/generating', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.send(JSON.stringify(datas));

    xhr.onload = function () {
        if (xhr.status === 200) {
            showImage();
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
}