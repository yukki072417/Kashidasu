function updateBookInformation() {
    const bookID = $('#book-id').val();
    const bookName = $('#book-name').val();
    const bookAuther = $('#book-auther').val();

    if (bookID.length > 10) {
        alert('10文字以内で入力してください');
    } else if (isNaN(bookID)) {
        alert('数字で入力してください');
    } else {
        CheckingDB(bookID, bookName, bookAuther);
    }
}

function CheckingDB(bookID, bookName, bookAuther){
    $.ajax({
        url: '/search-book',
        type: 'POST',
        data: {
            book_id : bookID,
            manual_search_mode : true
        },
        success: function(response){
            if(response.message == 'BOOK_NOT_EXIST') RequestRegisterBook(bookID, bookName, bookAuther);
            else alert('すでに登録されています');
        }
    })
}

function RequestRegisterBook(bookID, bookName, bookAuther) {

    const data = {  
        book_id : bookID,
        book_name : bookName,
        book_auther : bookAuther
    }

    $.ajax({
        url: '/register-book',
        type: 'POST',
        data: data,
        success: function(response) {
            alert('登録しました');
            window.location.href = '/register';
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}