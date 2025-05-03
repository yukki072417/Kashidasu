$(document).ready(function () {
    $('#csv-input').on('change', function () {
        const csvFile = this.files[0];
        if (csvFile) {
            alert(`ファイル「${csvFile.name}」が選択されました`);
        }
    });
});

function RegisterBooksByFile() {
    const csvInput = $('#csv-input');
    const csvFile = csvInput[0].files[0];
    if (csvFile == undefined) alert('ファイルが選択されていません');
    else {
        if (confirm('本を登録しますか？ \nまた、すでに登録されてる本は削除されます。 \n\nよろしいですか？')) {
            const csvInput = $('#csv-input');
            const csvFile = csvInput[0].files[0];
            convertToArray(csvFile);
        }
    }
}

function SelectFile() {
    const csvInput = $('#csv-input');
    csvInput.click();
}

function convertToArray(csvFile) {
    const reader = new FileReader();

    reader.readAsText(csvFile);
    reader.onload = () => {
        let csvArray = [];
        let lines = reader.result.split(/\r\n|\n/);

        for (let i = 0; i < lines.length; ++i) {
            let cells = lines[i];
            if (cells.length != 1) {
                csvArray.push(cells);
            }
        }
        RegisterBook(csvArray);
    }
}

function RegisterBook(csvArray) {
    const Register_URL = '/register-book';
    const AllDeleteDB_URL = '/delete-book';

    const datas = JSON.stringify({ isbn13_codes: csvArray.filter(item => item.trim() !== '') });

    fetch(AllDeleteDB_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all_delete: true })

    })
        .then(response => {
            fetch(Register_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: datas
            })
                .then(async response => {
                    const json = await response.json();
                    alert('正常に登録されました')
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        })
}