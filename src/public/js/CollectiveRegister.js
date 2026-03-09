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

// 「ファイルから本を登録（上書き）」ボタンが押されたときの処理
function RegisterBooksByFile() {
  const csvInput = $("#csv-input");
  const csvFile = csvInput[0].files[0];
  if (csvFile == undefined) {
    alert("ファイルが選択されていません");
  } else {
    // 確認ダイアログを表示
    if (
      confirm(
        "CSVファイルの内容で既存の書籍データを上書きしますか？\n既存のデータはすべて削除されます。\n\nよろしいですか？",
      )
    ) {
      convertToArray(csvFile);
    }
  }
}

// 「テキスト入力で本を登録（追加）」ボタンが押されたときの処理
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
      "入力された書籍データを既存のデータに追加しますか？\n既存の書籍データは保持されます。\n\nよろしいですか？",
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
    RegisterBook(csvArray, true); // 上書きモードで登録
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

  RegisterBook(textArray, false); // 追加モードで登録
}

// サーバーに本データを登録する関数
function RegisterBook(bookArray, isOverwrite) {
  const Register_URL = "/api/book";

  // ISBNコードが空でない本だけを送信データにする
  const datas = JSON.stringify({
    books: bookArray.filter((item) => item.isbn !== ""),
  });

  if (isOverwrite) {
    // 上書きモード：まず全ての本を削除してから新しい本を登録
    fetch("/api/book", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ all_delete: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("削除処理に失敗しました");
        }
        // 削除が終わったら本の登録リクエストを送信
        return fetch(Register_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: datas,
        });
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("登録処理に失敗しました");
        }
        const json = await response.json();
        if (json.success) {
          alert(`${bookArray.length}冊の本が正常に上書き登録されました`);
        } else {
          alert(`登録エラー: ${json.message || "不明なエラー"}`);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("登録中にエラーが発生しました: " + error.message);
      });
  } else {
    // 追加モード：新しい本を直接登録
    fetch(Register_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: datas,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("登録処理に失敗しました");
        }
        const json = await response.json();
        if (json.success) {
          alert(`${bookArray.length}冊の本が正常に追加登録されました`);
        } else {
          alert(`登録エラー: ${json.message || "不明なエラー"}`);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("登録中にエラーが発生しました: " + error.message);
      });
  }
}
