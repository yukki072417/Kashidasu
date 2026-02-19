window.onload = () => {
  // URLから本のIDを取得
  const urlPrams = new URL(window.location.href).searchParams;
  const isbn = urlPrams.get("isbn"); // ID -> isbn に変更
  let beforeIsbn; // beforeBookID -> beforeIsbn に変更

  // 本の情報をサーバーから取得してフォームに反映
  $.ajax({
    url: "/search-book",
    type: "POST",
    data: {
      isbn: isbn, // book_id -> isbn に変更
      manual_search_mode: true,
    },
    success: function (response) {
      const bookName_textbox = $("#book-name");
      const writter_textbox = $("#writter");
      const isbn_textbox = $("#book-id"); // bookID_textbox -> isbn_textbox に変更

      beforeIsbn = response.isbn; // beforeBookID -> beforeIsbn に変更, response.book_id -> response.isbn に変更

      // 取得した情報をフォームにセット
      isbn_textbox.val(response.isbn); // bookID_textbox -> isbn_textbox に変更, response.book_id -> response.isbn に変更
      bookName_textbox.val(response.title); // response.book_name -> response.title に変更
      writter_textbox.val(response.author); // response.book_auther -> response.author に変更

      // 貸出中の場合は編集不可にする
      if (response.isBorrowed) // book_is_lending -> isBorrowed に変更
        DisableTextBox(isbn_textbox, bookName_textbox, writter_textbox); // bookID_textbox -> isbn_textbox に変更
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });

  // 「編集」ボタンが押されたときの処理
  $("#edit-button").on("click", function () {
    const isbnValue = $("#book-id").val(); // bookIDValue -> isbnValue に変更
    const bookNameValue = $("#book-name").val();
    const bookAutherValue = $("#writter").val();
    EditBook(beforeIsbn, isbnValue, bookNameValue, bookAutherValue); // beforeBookID -> beforeIsbn に変更, bookIDValue -> isbnValue に変更
  });

  // 「削除」ボタンが押されたときの処理
  $("#delete-button").on("click", function () {
    const isbnValue = $("#book-id").val(); // bookIDValue -> isbnValue に変更
    DeleteBook(isbnValue); // bookIDValue -> isbnValue に変更
  });
};

// 本の情報を編集する関数
function EditBook(beforeIsbn, isbn, title, author) { // beforeBookID -> beforeIsbn, bookID -> isbn, bookName -> title, bookWritter -> author に変更
  $.ajax({
    url: "/upload-book",
    type: "POST",
    data: {
      before_isbn: beforeIsbn, // before_book_id -> before_isbn に変更
      isbn: isbn, // book_id -> isbn に変更
      title: title, // book_name -> title に変更
      author: author, // book_auther -> author に変更
    },
    success: function (response) {
      if (response.result === "SUCCESS") return alert("変更が適用されました");
      else return alert("エラー: 変更に失敗しました。もう一度お試しください");
    },
    error: function (xhr, status, error) {
      alert("エラー発生:", error);
    },
  });
}

// 本を削除する関数
function DeleteBook(isbn) { // bookID -> isbn に変更
  if (!confirm("本当に削除しますか？")) return;

  $.ajax({
    url: "/delete-book",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      isbn: isbn, // book_id -> isbn に変更
    }),
    success: function (response) {
      console.log(response);
      window.location.href = "/edit"; // 削除後に編集ページへリダイレクト
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
}

// 貸出中の場合にテキストボックスを無効化し警告を表示する関数
function DisableTextBox(isbn_textbox, bookName_textbox, writter_textbox) { // bookID_textbox -> isbn_textbox に変更
  const warningText = $("<p>貸出中は変更できません</p>").css("color", "red");

  writter_textbox.prop("disabled", true); // #writter -> writter_textbox に変更
  bookName_textbox.prop("disabled", true); // #book-name -> bookName_textbox に変更
  $(".edit-submit").prop("disabled", true);
  isbn_textbox.prop("disabled", true); // #book-id -> isbn_textbox に変更
  $("form").append(warningText);
}
