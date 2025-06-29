window.onload = () => {
    // URLから本のIDを取得
    const urlPrams = new URL(window.location.href).searchParams;
    const bookID = urlPrams.get('ID');
    let beforeBookID;
    
    // 本の情報をサーバーから取得してフォームに反映
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

            beforeBookID = response.book_id; // 変更前の本IDを保存

            // 取得した情報をフォームにセット
            bookID_textbox.val(response.book_id);
            bookName_textbox.val(response.book_name);
            writter_textbox.val(response.book_auther);

            // 貸出中の場合は編集不可にする
            if(response.book_is_lending)
                DisableTextBox(bookID_textbox, bookName_textbox, writter_textbox);
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });

    // 「編集」ボタンが押されたときの処理
    $('#edit-button').on('click', function(){
        const bookIDValue = $('#book-id').val();
        const bookNameValue = $('#book-name').val();
        const bookAutherValue = $('#writter').val();
        EditBook(beforeBookID, bookIDValue, bookNameValue, bookAutherValue);
    });

    // 「削除」ボタンが押されたときの処理
    $('#delete-button').on('click', function(){
        const bookIDValue = $('#book-id').val();        
        DeleteBook(bookIDValue);
    });
}

// 本の情報を編集する関数
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
            if(response.result === 'SUCCESS') return alert('変更が適用されました');window.onload = () => {
    // URLから本のIDを取得
    const urlPrams = new URL(window.location.href).searchParams;
    const bookID = urlPrams.get('ID');
    let beforeBookID;
    
    // 本の情報をサーバーから取得してフォームに反映
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

            beforeBookID = response.book_id; // 変更前の本IDを保存

            // 取得した情報をフォームにセット
            bookID_textbox.val(response.book_id);
            bookName_textbox.val(response.book_name);
            writter_textbox.val(response.book_auther);

            // 貸出中の場合は編集不可にする
            if(response.book_is_lending)
                DisableTextBox(bookID_textbox, bookName_textbox, writter_textbox);
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });

    // 「編集」ボタンが押されたときの処理
    $('#edit-button').on('click', function(){
        const bookIDValue = $('#book-id').val();
        const bookNameValue = $('#book-name').val();
        const bookAutherValue = $('#writter').val();
        EditBook(beforeBookID, bookIDValue, bookNameValue, bookAutherValue);
    });

    // 「削除」ボタンが押されたときの処理
    $('#delete-button').on('click', function(){
        const bookIDValue = $('#book-id').val();        
        DeleteBook(bookIDValue);
    });
}

// 本の情報を編集する関数
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
            else return alert('エラー: 変更に失敗しました。もう一度お試しください'); 
        },
        error: function(xhr, status, error) {
            alert('エラー発生:', error);
        }
    });
}

// 本を削除する関数
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
            window.location.href = '/edit'; // 削除後に編集ページへリダイレクト
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

// 貸出中の場合にテキストボックスを無効化し警告を表示する関数
function DisableTextBox(){
    const warningText = $('<p>貸出中は変更できません</p>').css('color', 'red');
    
    $('#writter').prop('disabled', true);
    $('#book-name').prop('disabled', true);
    $('.edit-submit').prop('disabled', true);
    $('#book-id').prop('disabled', true);
    $('form').append(warningText);
}
        },
        error: function(xhr, status, error) {
            alert('エラー発生:', error);
        }
    });
}

// 本を削除する関数
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
            window.location.href = '/edit'; // 削除後に編集ページへリダイレクト
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

// 貸出中の場合にテキストボックスを無効化し警告を表示する関数
function DisableTextBox(){
    const warningText = $('<p>貸出中は変更できません</p>').css('color', 'red');
    
    $('#writter').prop('disabled', true);
    $('#book-name').prop('disabled', true);
    $('.edit-submit').prop('disabled', true);
    $('#book-id').prop('disabled', true);
    $('form').append(warningText);
}