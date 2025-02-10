const bookNameTextBox = document.getElementsByName('book-name');
const writterTextBox = document.getElementsByName('writter');

const url_prams = new URL(window.location.href).searchParams;
const bookID = url_prams.get('id');

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

            bookID.val(response[0].ID);
            bookName.val(response[0].BOOK_NAME);
            writter.val(response[0].WRITTER);

            console.log(response[0]);

            if(response[0].IS_LENDING) lockTextBox();
            else return;

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