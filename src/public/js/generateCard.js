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
        ID: studentId,
        GREAD: gread,
        CLASS: className,
        NUMBER: number
    };

    $(function () {
        $('#image').append('<img id="card" src="/images/GeneratingNow.png" width="300" height="75">');
    });

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/generating', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.send(JSON.stringify(datas));

    xhr.onload = function () {
        if (xhr.status == 200) {
            showImage();
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
}

// グローバルスコープで関数を定義
window.download = function() {
    const fileUrl = '/pdf/output_page.1.png';
    const fileName = 'output_page.1.png';

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    location.reload();
}

function showImage() {

    $(function () {

        if ($('#card').length) {
            $('#card').remove();
        }

        $('#image').append('<img id="card" src="/pdf/output_page.1.png">');
        
        $('#form-submit').removeAttr('value');
        $('#form-submit').removeAttr('onclick');
        $('#form-submit').attr('value', 'ダウンロードする');
        $('#form-submit').attr('onclick', 'download()');

    });
}