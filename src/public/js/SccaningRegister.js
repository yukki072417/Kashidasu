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
            Detected(result.codeResult.code);
        } 
    });
}
InitQuagga();

function Detected(resultCode){
    if(confirm(`ISBNコードは ${resultCode} でよろしいですか？`)){
        RegisterBook(resultCode);
    }

}
function RegisterBook(code){
    const data = {'isbn13_codes': [code]};
    fetch('/register-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(async response => {
        const json = await response.json();
        console.log(json);
    });
}