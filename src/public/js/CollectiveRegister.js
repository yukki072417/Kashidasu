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

// サーバーに本データを登録する関数
function RegisterBook(csvArray) {
  const Register_URL = "/register-book";
  const AllDeleteDB_URL = "/delete-book";

  // ISBNコードが空でない本だけを送信データにする
  const datas = JSON.stringify({
    books: csvArray.filter((item) => item.isbn !== ""),
  });

  // まず全ての本を削除してから新しい本を登録
  fetch(AllDeleteDB_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ all_delete: true }),
  }).then((response) => {
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
        alert("正常に登録されました");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });
}
