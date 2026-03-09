window.onload = () => {
  // URLから本のIDを取得
  const urlPrams = new URL(window.location.href).searchParams;
  const isbn = urlPrams.get("isbn"); // ID -> isbn に変更
  let beforeIsbn; // beforeBookID -> beforeIsbn に変更

  // 本の情報をサーバーから取得してフォームに反映
  $.ajax({
    url: "/api/book/search",
    type: "POST",
    data: {
      query: isbn, // isbnをqueryとして渡す
      searchType: "isbn",
    },
    success: function (response) {
      const bookName_textbox = $("#book-name");
      const writter_textbox = $("#writter");
      const isbn_textbox = $("#book-id");

      if (response.success && response.data) {
        beforeIsbn = response.data.isbn;

        // 取得した情報をフォームにセット
        isbn_textbox.val(response.data.isbn);
        bookName_textbox.val(response.data.title);
        writter_textbox.val(response.data.author);

        // 貸出中の場合は編集不可にする
        if (response.data.isBorrowed)
          DisableTextBox(isbn_textbox, bookName_textbox, writter_textbox);
      } else {
        alert("書籍が見つかりません");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      alert("書籍情報の取得に失敗しました");
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
function EditBook(beforeIsbn, isbn, title, author) {
  $.ajax({
    url: "/api/book",
    type: "PUT",
    data: {
      before_isbn: beforeIsbn,
      isbn: isbn,
      title: title,
      author: author,
    },
    success: function (response) {
      if (response.success) {
        alert("変更が適用されました");
        window.location.href = "/edit";
      } else {
        alert("エラー: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      alert("エラー発生: " + error);
    },
  });
}

// 本を削除する関数
function DeleteBook(isbn) {
  if (!confirm("本当に削除しますか？")) return;

  $.ajax({
    url: "/api/book",
    type: "DELETE",
    contentType: "application/json",
    data: JSON.stringify({
      isbn: isbn,
    }),
    success: function (response) {
      console.log(response);
      if (response.success) {
        alert("書籍が削除されました");
        window.location.href = "/edit"; // 削除後に編集ページへリダイレクト
      } else {
        alert("エラー: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      alert("エラー発生: " + error);
    },
  });
}

// 貸出中の場合にテキストボックスを無効化し警告を表示する関数
function DisableTextBox(isbn_textbox, bookName_textbox, writter_textbox) {
  // bookID_textbox -> isbn_textbox に変更
  const warningText = $("<p>貸出中は変更できません</p>").css("color", "red");

  writter_textbox.prop("disabled", true); // #writter -> writter_textbox に変更
  bookName_textbox.prop("disabled", true); // #book-name -> bookName_textbox に変更
  $(".edit-submit").prop("disabled", true);
  isbn_textbox.prop("disabled", true); // #book-id -> isbn_textbox に変更
  $("form").append(warningText);
}
