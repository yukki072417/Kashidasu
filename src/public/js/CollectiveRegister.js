// ページの読み込みが完了したときの処理
$(document).ready(function () {
  // ファイル選択時にファイル名をアラート表示
  $("#csv-input").on("change", function () {
    const csvFile = this.files[0];
    if (csvFile) {
      alert(`ファイル「${csvFile.name}」が選択されました`);
    }
  });
});

// 「ファイルから本を登録」ボタンが押されたときの処理
function RegisterBooksByFile() {
  const csvInput = $("#csv-input");
  const csvFile = csvInput[0].files[0];
  if (csvFile == undefined) {
    alert("ファイルが選択されていません");
  } else {
    // 確認ダイアログを表示
    if (
      confirm(
        "本を登録しますか？ \nまた、すでに登録されてる本は削除されます。 \n\nよろしいですか？",
      )
    ) {
      convertToArray(csvFile);
    }
  }
}

// 「テキスト入力で本を登録」ボタンが押されたときの処理
function RegisterBooksByText() {
  const textInput = $("#text-input");
  const textContent = textInput.val().trim();

  if (textContent == "") {
    alert("テキストが入力されていません");
    return;
  }

  // 確認ダイアログを表示
  if (
    confirm(
      "本を登録しますか？ \nまた、すでに登録されてる本は削除されます。 \n\nよろしいですか？",
    )
  ) {
    convertTextToArray(textContent);
  }
}

// ファイル選択ダイアログを開く関数
function SelectFile() {
  const csvInput = $("#csv-input");
  csvInput.click();
}

// CSVファイルを配列に変換する関数
function convertToArray(csvFile) {
  const reader = new FileReader();

  reader.readAsText(csvFile);
  reader.onload = () => {
    let csvArray = [];
    let lines = reader.result.split(/\r\n|\n/);

    // 1行目（ヘッダー）をスキップして2行目以降を処理
    for (let i = 1; i < lines.length; ++i) {
      let cells = lines[i].split(","); // カンマで分割
      if (cells.length >= 3) {
        // ISBNコード、タイトル、著者が存在する場合のみ
        csvArray.push({
          isbn: cells[0].trim(), // 1列目: ISBNコード
          title: cells[1].trim(), // 2列目: 本のタイトル
          author: cells[2].trim(), // 3列目: 著者
        });
      }
    }
    console.log(csvArray); // デバッグ用：配列の中身を表示
    RegisterBook(csvArray); // サーバーに登録
  };
}

// テキスト入力を配列に変換する関数
function convertTextToArray(textContent) {
  let textArray = [];
  let lines = textContent.split(/\r\n|\n/);

  // 各行を処理
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i].trim();
    if (line === "") continue; // 空行をスキップ

    let cells = line.split(","); // カンマで分割
    if (cells.length >= 3) {
      // ISBNコード、タイトル、著者が存在する場合のみ
      textArray.push({
        isbn: cells[0].trim(), // 1列目: ISBNコード
        title: cells[1].trim(), // 2列目: 本のタイトル
        author: cells[2].trim(), // 3列目: 著者
      });
    }
  }

  if (textArray.length === 0) {
    alert(
      "有効な書籍データが見つかりませんでした。\n入力形式を確認してください。",
    );
    return;
  }

  console.log(textArray); // デバッグ用：配列の中身を表示
  RegisterBook(textArray); // サーバーに登録
}

// サーバーに本データを登録する関数
function RegisterBook(bookArray) {
  const Register_URL = "/api/book/register";
  const AllDeleteDB_URL = "/api/book/delete";

  // ISBNコードが空でない本だけを送信データにする
  const datas = JSON.stringify({
    books: bookArray.filter((item) => item.isbn !== ""),
  });

  // まず全ての本を削除してから新しい本を登録
  fetch(AllDeleteDB_URL, {
    method: "DELETE", // POSTからDELETEに変更
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ all_delete: true }),
  })
    .then((response) => {
      // 削除が終わったら本の登録リクエストを送信
      fetch(Register_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: datas,
      })
        .then(async (response) => {
          const json = await response.json();
          alert(`${bookArray.length}冊の本が正常に登録されました`);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          alert("登録中にエラーが発生しました");
        });
    })
    .catch((error) => {
      console.error("Delete error:", error);
      alert("既存データの削除中にエラーが発生しました");
    });
}
