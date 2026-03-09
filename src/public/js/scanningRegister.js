alert("本の裏にあるISBNコード(上部)をスキャンしてください");

// 状態管理用の変数
let currentMode = "register"; // 'register' モード固定

/**
 * UIステータスを更新する関数
 */
function updateStatus(status, message, progress = 0, indicatorType = "active") {
  const statusText = document.getElementById("status-text");
  const statusMessage = document.getElementById("status-message");
  const progressFill = document.getElementById("progress-fill");
  const statusIndicator = document.getElementById("status-indicator");

  if (statusText) statusText.textContent = status;
  if (statusMessage) statusMessage.textContent = message;
  if (progressFill) progressFill.style.width = `${progress}%`;

  // インジケーターのクラスをリセット
  if (statusIndicator) {
    statusIndicator.className = "status-indicator";
    statusIndicator.classList.add(indicatorType);
  }
}

/**
 * バーコード情報を表示する関数
 */
function showBarcodeInfo(type, barcode) {
  const container = document.getElementById("barcode-info-container");
  if (container) {
    const typeText = type === "isbn" ? "ISBN" : "バーコード";
    container.innerHTML = `
      <div class="barcode-info">
        <strong>${typeText}:</strong> ${barcode}
      </div>
    `;
  }
}

/**
 * エラーメッセージを表示する関数
 */
function showError(message) {
  const errorElement = document.getElementById("error-message");
  const successElement = document.getElementById("success-message");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
  if (successElement) successElement.style.display = "none";

  // 3秒後に非表示
  setTimeout(() => {
    if (errorElement) errorElement.style.display = "none";
  }, 3000);
}

/**
 * 成功メッセージを表示する関数
 */
function showSuccess(message) {
  const errorElement = document.getElementById("error-message");
  const successElement = document.getElementById("success-message");
  const statusPanel = document.querySelector(".status-panel");

  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
  }
  if (errorElement) errorElement.style.display = "none";

  // 成功アニメーション
  if (statusPanel) {
    statusPanel.classList.add("success-animation");
    setTimeout(() => {
      statusPanel.classList.remove("success-animation");
    }, 600);
  }
}

// カメラバーコードリーダ初期化
function InitQuagga() {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#interactive"),
      },
      decoder: {
        // ISBNコードのバーコード規格がeanのため、ean_readerで必ず固定
        readers: ["ean_reader"],
      },
    },
    (err) => {
      if (err) {
        console.error(err);
        updateStatus(
          "初期化エラー",
          "カメラの初期化に失敗しました",
          0,
          "error",
        );
        return;
      }
      Quagga.start();
      updateStatus("準備完了", "ISBNコードをスキャンしてください", 0, "active");
    },
  );

  Quagga.onDetected((result) => {
    if (result.codeResult.code) {
      Quagga.offDetected(); // イベントリスナーを解除
      handleBarcodeDetected(result.codeResult.code);
    }
  });
}

// 手入力バーコード処理の初期化
function InitManualBarcodeReader() {
  const $hiddenInput = $("#hidden-barcode-input");
  const $manualInput = $("#manual-barcode-input");

  // USBバーコードリーダー → hidden input にフォーカス
  // ただし手入力テキストボックスがアクティブな場合はフォーカスを奪わない
  $(document).on("keydown", (e) => {
    if ($manualInput.length && document.activeElement === $manualInput[0]) {
      // 手入力中はそのまま
      return;
    }
    // Enter / Tab / 特殊キー以外のみ hidden input にフォーカス移動
    if (e.key.length === 1 || e.key === "Enter") {
      $hiddenInput.focus();
    }
  });

  // USBバーコードリーダー（隠し入力）
  $hiddenInput.on("input", () => {
    const cleanedValue = cleanInputValue($hiddenInput.val());
    $hiddenInput.val(cleanedValue);

    if (cleanedValue.length === 13) {
      console.log("USBバーコードリーダー: ISBNコード", cleanedValue);
      handleBarcodeDetected(cleanedValue);
      $hiddenInput.val("");
    }
  });

  // 手入力テキストボックス
  if ($manualInput.length) {
    $manualInput.on("input", () => {
      const cleanedValue = cleanInputValue($manualInput.val());
      $manualInput.val(cleanedValue);

      if (cleanedValue.length === 13) {
        handleBarcodeDetected(cleanedValue);
        $manualInput.val("");
      }
    });

    // Enterキーで手動確定（桁数に関わらず送信できる補助機能）
    $manualInput.on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const cleanedValue = cleanInputValue($manualInput.val());
        if (cleanedValue.length > 0) {
          handleBarcodeDetected(cleanedValue);
          $manualInput.val("");
        }
      }
      // Enterキーのバブルを止めて hidden input にフォーカスが移らないようにする
      e.stopPropagation();
    });
  }
}

/**
 * 入力値をクリーンアップ（全角→半角変換、不要な文字を除去）
 */
function cleanInputValue(value) {
  // 全角英数字→半角に変換
  const halfWidthValue = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );

  // 半角英数字以外を除去
  const cleanedValue = halfWidthValue.replace(/[^0-9a-zA-Z]/g, "");

  return cleanedValue;
}

/**
 * バーコード検出時の処理
 */
function handleBarcodeDetected(barcode) {
  console.log("バーコード検出:", barcode);
  showBarcodeInfo("isbn", barcode);
  updateStatus("バーコード検出", "ISBNコード: " + barcode, 50, "waiting");

  if (confirm(`ISBNコードは ${barcode} でよろしいですか？`)) {
    FetchBookInfo(barcode);
  } else {
    // 再度スキャンを待機
    updateStatus("準備完了", "ISBNコードをスキャンしてください", 0, "active");
    if (typeof Quagga !== "undefined") {
      Quagga.start();
    }
  }
}

// Google Books APIから本の情報を取得
async function FetchBookInfo(isbn) {
  updateStatus(
    "情報取得中",
    "Google Books APIから情報を取得中...",
    75,
    "active",
  );

  const URL = BOOKS_API_KEY
    ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${BOOKS_API_KEY}`
    : `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error("API Error");
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      const title = book.title || "";
      const author = book.authors ? book.authors.join(", ") : "";

      if (title && author) {
        updateStatus("情報取得完了", `タイトル: ${title}`, 90, "success");
        if (
          confirm(
            `タイトル: ${title}\n著者: ${author}\n\nこの情報で登録しますか？`,
          )
        ) {
          RegisterBook(isbn, title, author);
          return;
        }
      }
    }
    ManualInput(isbn);
  } catch (error) {
    console.error("API Error:", error);
    showError("APIからの情報取得に失敗しました。手動入力してください。");
    ManualInput(isbn);
  }
}

// 手動入力処理
function ManualInput(isbn) {
  updateStatus("手動入力", "書籍情報を手動で入力してください", 90, "waiting");
  const title = prompt("本のタイトルを入力してください:");
  const author = prompt("著者名を入力してください:");
  if (title && author) {
    RegisterBook(isbn, title, author);
  } else {
    showError("タイトルと著者名は必須です。");
    updateStatus("準備完了", "ISBNコードをスキャンしてください", 0, "active");
    if (typeof Quagga !== "undefined") {
      Quagga.start();
    }
  }
}

// 本の登録処理
function RegisterBook(isbn, title, author) {
  updateStatus("登録中", "書籍を登録中...", 95, "active");

  const data = {
    isbn: isbn,
    title: title,
    author: author,
  };

  // 本の登録のリクエストを送信
  fetch("/api/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const json = await response.json();
      if (!json.success) {
        if (json.message.includes("既に存在")) {
          showError("この本はすでに登録されています");
          updateStatus("登録エラー", "書籍は既に登録されています", 0, "error");
        } else {
          showError("登録エラー: " + json.message);
          updateStatus("登録エラー", json.message, 0, "error");
        }
      } else {
        showSuccess("本が正常に登録されました。");
        updateStatus("登録完了", "書籍の登録が完了しました", 100, "success");

        // 3秒後にリロード
        setTimeout(() => {
          location.reload();
        }, 3000);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      showError("本の登録中にエラーが発生しました。");
      updateStatus("登録エラー", "書籍の登録に失敗しました", 0, "error");
    });
}

// 初期化
$(document).ready(() => {
  updateStatus("初期化中", "バーコードリーダーを初期化中...", 25, "active");

  // カメラバーコードリーダーを初期化
  try {
    InitQuagga();
  } catch (error) {
    console.error("Quagga初期化エラー:", error);
    updateStatus(
      "カメラエラー",
      "カメラの初期化に失敗しました。USBバーコードリーダーを使用してください。",
      0,
      "warning",
    );
  }

  // 手入力バーコードリーダーを初期化
  InitManualBarcodeReader();

  // 初期フォーカスを設定
  setTimeout(() => {
    $("#hidden-barcode-input").focus();
  }, 100);
});
