window.onload = async function () {
  // URLから本のIDを取得
  const urlPrams = new URL(window.location.href).searchParams;
  const isbn = urlPrams.get("isbn");
  let beforeIsbn;

  try {
    // 本の情報をサーバーから取得してフォームに反映
    const response = await fetch(
      `/api/book/one?isbn=${isbn}&manual_search_mode=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const responseData = await response.json();
      const bookName_textbox = $("#book-name");
      const writter_textbox = $("#writter");
      const isbn_textbox = $("#book-id");

      console.log("APIレスポンス:", responseData);

      if (responseData.success && responseData.data) {
        beforeIsbn = responseData.data.isbn;

        // 取得した情報をフォームにセット
        isbn_textbox.val(responseData.data.isbn);
        bookName_textbox.val(responseData.data.title);
        writter_textbox.val(responseData.data.author);

        // 貸出情報を取得して貸出中かどうかを確認
        try {
          const loanResponse = await fetch(`/api/book/loan?isbn=${isbn}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (loanResponse.ok) {
            const loanData = await loanResponse.json();
            if (
              loanData.success &&
              loanData.data &&
              !loanData.data.returnDate
            ) {
              // 貸出中の場合は編集不可にする
              DisableTextBox(isbn_textbox, bookName_textbox, writter_textbox);
            }
          } else {
            console.error("貸出情報取得エラー:", loanResponse.status);
          }
        } catch (loanError) {
          console.error("貸出情報取得エラー:", loanError);
        }
      } else {
        console.error("書籍データがありません:", responseData);
        alert("書籍が見つかりません");
      }
    } else {
      console.error("書籍情報取得エラー:", response.status);
      alert("書籍情報の取得に失敗しました");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("書籍情報の取得に失敗しました");
  }

  // 「編集」ボタンが押されたときの処理
  $("#edit-button").on("click", function () {
    const isbnValue = $("#book-id").val();
    const bookNameValue = $("#book-name").val();
    const bookAutherValue = $("#writter").val();
    EditBook(beforeIsbn, isbnValue, bookNameValue, bookAutherValue);
  });

  // 「削除」ボタンが押されたときの処理
  $("#delete-button").on("click", function () {
    const isbnValue = $("#book-id").val();
    DeleteBook(isbnValue);
  });
};

// 本の情報を編集する関数
async function EditBook(beforeIsbn, isbn, title, author) {
  try {
    // バリデーション
    if (!isbn || !title || !author) {
      alert("ISBN、タイトル、著者名は必須です");
      return;
    }

    const response = await fetch("/api/book", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        before_isbn: beforeIsbn,
        isbn: isbn,
        title: title,
        author: author,
      }),
    });

    const result = await response.json();

    // ステータスコードに応じた処理
    if (response.ok && result.success) {
      alert("変更が適用されました");
      window.location.href = "/book-list";
    } else {
      // 400エラー（バリデーションエラー）の場合
      if (response.status === 400) {
        alert("入力エラー: " + result.message);
      } else if (response.status === 404) {
        alert("書籍が見つかりません: " + result.message);
      } else {
        alert("エラー: " + (result.message || "書籍の更新に失敗しました"));
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("エラー発生: " + error.message);
  }
}

// 本を削除する関数
async function DeleteBook(isbn) {
  if (!confirm("本当に削除しますか？")) return;

  try {
    // バリデーション
    if (!isbn) {
      alert("ISBNは必須です");
      return;
    }

    const response = await fetch("/api/book", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isbn: isbn,
      }),
    });

    const result = await response.json();
    console.log(result);

    // ステータスコードに応じた処理
    if (response.ok && result.success) {
      alert("書籍が削除されました");
      window.location.href = "/book-list"; // 削除後に書籍一覧ページへリダイレクト
    } else {
      // 400エラー（バリデーションエラー）の場合
      if (response.status === 400) {
        alert("入力エラー: " + result.message);
      } else if (response.status === 404) {
        alert("書籍が見つかりません: " + result.message);
      } else if (response.status === 500) {
        alert("サーバーエラー: " + result.message);
      } else {
        alert("エラー: " + (result.message || "書籍の削除に失敗しました"));
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("エラー発生: " + error.message);
  }
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
