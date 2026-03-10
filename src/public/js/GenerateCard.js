function SendContent() {
  // 各入力欄の値を取得
  const studentId = document.getElementById("studentId").value;
  const gread = document.getElementById("gread").value;
  const className = document.getElementById("class").value;
  const number = document.getElementById("number").value;

  // どれか1つでも未入力なら警告を表示して処理を中断
  if (!studentId || !gread || !className || !number) {
    alert("すべてのフィールドを入力してください");
    return;
  }

  // サーバーに送信するデータを作成
  const datas = {
    id: studentId,
    gread: gread,
    class: className,
    number: number,
  };

  // 画像生成中の表示を追加
  $(function () {
    $("#image").append(
      '<img id="card" src="/images/GeneratingNow.png" width="300" height="75">',
    );
  });

  // fetchでPOSTリクエストを送信
  fetch("/api/card/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(datas),
  })
    .then(async (response) => {
      const json = await response.json();

      if (response.ok && json.success) {
        ShowImage();
      } else {
        // ステータスコードに応じたエラーメッセージ
        let errorMessage = json.message || "カード生成に失敗しました";

        if (response.status === 400) {
          errorMessage = "入力エラー: " + errorMessage;
        } else if (response.status === 500) {
          errorMessage = "サーバーエラー: " + errorMessage;
        }

        alert(errorMessage);
        console.error("Error:", response.statusText);

        // 生成中の画像を削除
        $("#card").remove();
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("カード生成中にエラーが発生しました: " + error.message);

      // 生成中の画像を削除
      $("#card").remove();
    });
}

// ダウンロード自体の処理
window.download = function () {
  const fileUrl = "/pdf/kashidasu_card.png";
  const fileName = "kashidasu_card.png";

  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  location.reload();
};

// 生成されたカード画像を画面に表示し、ボタンを「ダウンロードする」に切り替える関数
function ShowImage() {
  $(function () {
    // すでに表示されていれば削除
    $("#card").remove();

    // PDFを表示
    $("#image").append(
      '<iframe id="card" src="/pdf/kashidasu_card.pdf" width="600" height="400"></iframe>',
    );

    // ボタンの表示・動作を「ダウンロードする」に変更
    $("#form-submit").removeAttr("value");
    $("#form-submit").removeAttr("onclick");
    $("#form-submit").attr("value", "ダウンロードする");
    $("#form-submit").attr("onclick", "download()");
  });
}
