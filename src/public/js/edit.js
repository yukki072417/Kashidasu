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
            const bookName = $('#book-name');
            const writter = $('#writter');
            const bookID = $('#book-id');

            bookID.val(response.ID);
            bookName.val(response.BOOK_NAME);
            writter.val(response.WRITTER);
            if(response.IS_LENDING)
                lockTextBox();
            else
                return;

        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

function lockTextBox(){
    const warningText = $('<p>貸出中は変更できません</p>').css('color', 'red');
    
    $('#writter').prop('disabled', true);
    $('#book-name').prop('disabled', true);
    $('.edit-submit').prop('disabled', true);
    $('#book-id').prop('disabled', true);
    $('form').append(warningText);
}

function deleteBook(){

    if(!confirm('本当に削除しますか？')) return;   

    $.ajax({
        url: '/delete-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  
            "bookID": bookID
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