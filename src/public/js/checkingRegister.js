function checking() {
    const bookID = $('#bookID').val();

    if (bookID.length > 10) {
        alert('10文字以内で入力してください');
    } else if (isNaN(bookID)) {
        alert('数字で入力してください');
    } else {
        requestRegisterBook();
    }
}

function requestRegisterBook() {
    const bookID = $('#bookID').val();
    const bookName = $('#bookName').val();
    const writter = $('#writter').val();

    $.ajax({
        url: '/register-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  
            "bookID": bookID,
            "bookName": bookName,
            "writter": writter
        }),
        success: function(response) {
            alert('登録しました');
            window.location.href = '/register';
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}