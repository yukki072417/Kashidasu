function RegisterBooksByFile() {
    
    const csvInput = $('#csv-input');
    const csvFile = csvInput[0].files[0];

    if (csvFile == undefined) alert('ファイルが選択されていません');
    else {
        convertToArray(csvFile);
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
    const URL = '/register-book';

    const datas = JSON.stringify({ isbn13_codes: csvArray.filter(item => item.trim() !== '') });

    console.log(datas);
    fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: datas
    })
    .then(async response => {
        const json = await response.json();
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}