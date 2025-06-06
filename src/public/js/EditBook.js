window.onload = () => {
    const urlPrams = new URL(window.location.href).searchParams;
    const bookID = urlPrams.get('ID');
    let beforeBookID;
    
    $.ajax({
        url: '/search-book',
        type: 'POST',
        data: {
            "book_id": bookID,
            "manual_search_mode": true
        },
        success: function(response) {
            const bookName_textbox = $('#book-name');
            const writter_textbox = $('#writter');
            const bookID_textbox = $('#book-id');

            beforeBookID = response.book_id;

            bookID_textbox.val(response.book_id);
            bookName_textbox.val(response.book_name);
            writter_textbox.val(response.book_auther);

            if(response.book_is_lending)
                DisableTextBox(bookID_textbox, bookName_textbox, writter_textbox);
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });

    $('#edit-button').on('click', function(){
        const bookIDValue = $('#book-id').val();
        const bookNameValue = $('#book-name').val();
        const bookAutherValue = $('#writter').val();
        EditBook(beforeBookID, bookIDValue, bookNameValue, bookAutherValue);
    });

    $('#delete-button').on('click', function(){
        const bookIDValue = $('#book-id').val();        
        DeleteBook(bookIDValue);
    });
}

function EditBook(beforeBookID, bookID, bookName, bookWritter){
    $.ajax({
        url: '/upload-book',
        type: 'POST',
        data: {
            before_book_id: beforeBookID,
            book_id: bookID,
            book_name: bookName,
            book_auther: bookWritter
        },
        success: function(response) {
            if(response.result === 'SUCCESS') return alert('変更が適用されました');
            // else return alert('エラー: FAILED OF CHANGE'); 
        },
        error: function(xhr, status, error) {
            alert('エラー発生:', error);
        }
    });
}

function DeleteBook(bookID){
    if(!confirm('本当に削除しますか？')) return;   

    $.ajax({
        url: '/delete-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  
            'book_id': bookID
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

function DisableTextBox(){
    const warningText = $('<p>貸出中は変更できません</p>').css('color', 'red');
    
    $('#writter').prop('disabled', true);
    $('#book-name').prop('disabled', true);
    $('.edit-submit').prop('disabled', true);
    $('#book-id').prop('disabled', true);
    $('form').append(warningText);
}