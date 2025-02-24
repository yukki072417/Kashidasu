const bookNameTextBox = document.getElementsByName('book-name');
const writterTextBox = document.getElementsByName('writter');

const url_prams = new URL(window.location.href).searchParams;

const bookID = url_prams.get('ID');
const bookName = url_prams.get('BOOK_NAME');
const bookWritter = url_prams.get('WRITTER');

window.onload = () => {
    $.ajax({
        url: '/searchBook',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "bookID": bookID,
            "bookNum": 1,
            "manualSearchMode": true
        }),
        success: function(response) {
            const bookName_textbox = $('#book-name');
            const writter_textbox = $('#writter');
            const bookID_textbox = $('#book-id');

            bookID_textbox.val(response.ID);
            bookName_textbox.val(response.BOOK_NAME);
            writter_textbox.val(response.WRITTER);
            if(response.IS_LENDING)
                LockTextBox();
            else
                return;
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

function EditBook(){

    const bookID = $('#book-id').val();
    const bookName = $('#book-name').val();
    const bookWritter = $('#writter').val();

    $.ajax({
        url: '/upload-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "bookID": bookID,
            "bookName": bookName,
            "writter": bookWritter
        }),
        success: function(response) {


            if(response[0].result = 'Sucsess');
                alert('変更が適用されました');
        },
        error: function(xhr, status, error) {
            alert('エラー発生:', error);
        }
    });

}

function LockTextBox(){
    const warningText = $('<p>貸出中は変更できません</p>').css('color', 'red');
    
    $('#writter').prop('disabled', true);
    $('#book-name').prop('disabled', true);
    $('.edit-submit').prop('disabled', true);
    $('#book-id').prop('disabled', true);
    $('form').append(warningText);
}

function DeleteBook(){

    if(!confirm('本当に削除しますか？')) return;   

    $.ajax({
        url: '/delete-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  
            "BOOK_ID": bookID
        }),
        success: function(response) {
            console.log(response);
            window.location.href = '/edit';
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}