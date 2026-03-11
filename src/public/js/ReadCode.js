// 状態管理用の変数
let userBarcode = null; // 10桁のバーコード（ユーザーカード）
let isbnBarcode = null; // 13桁のISBNコード（本のバーコード）
let isUserBarcodeRead = false; // ユーザーカードが読み取られたかどうか
let currentMode = "lend"; // 'lend' または 'return'

/**
 * UIステータスを更新する関数
 */
function updateStatus(status, message, progress = 0, indicatorType = "active") {
  const statusText = document.getElementById("status-text");
  const statusMessage = document.getElementById("status-message");
  const progressFill = document.getElementById("progress-fill");
  const statusIndicator = document.getElementById("status-indicator");

  statusText.textContent = status;
  statusMessage.textContent = message;
  progressFill.style.width = `${progress}%`;

  // インジケーターのクラスをリセット
  statusIndicator.className = "status-indicator";
  statusIndicator.classList.add(indicatorType);
}

/**
 * バーコード情報を表示する関数
 */
function showBarcodeInfo(type, barcode) {
  const container = document.getElementById("barcode-info-container");
  const typeText = type === "user" ? "ユーザーID" : "ISBN";
  container.innerHTML = `
    <div class="barcode-info">
      <strong>${typeText}:</strong> ${barcode}
    </div>
  `;
}

/**
 * エラーメッセージを表示する関数
 */
function showError(message) {
  const errorElement = document.getElementById("error-message");
  const successElement = document.getElementById("success-message");

  errorElement.textContent = message;
  errorElement.style.display = "block";
  successElement.style.display = "none";

  // 3秒後に非表示
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

/**
 * 成功メッセージを表示する関数
 */
function showSuccess(message) {
  const errorElement = document.getElementById("error-message");
  const successElement = document.getElementById("success-message");
  const statusPanel = document.querySelector(".status-panel");

  successElement.textContent = message;
  successElement.style.display = "block";
  errorElement.style.display = "none";

  // 成功アニメーション
  statusPanel.classList.add("success-animation");
  setTimeout(() => {
    statusPanel.classList.remove("success-animation");
  }, 600);
}

/**
 * Quaggaの初期化
 * @param {string} readerType - 使用するバーコードリーダーの種類（code_128_reader または ean_reader）
 */
function initializeQuagga(readerType) {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#interactive"),
      },
      decoder: {
        readers: [readerType],
      },
    },
    (err) => {
      if (err) {
        console.error("Quagga初期化エラー:", err);
        updateStatus(
          "初期化エラー",
          "カメラの初期化に失敗しました",
          0,
          "error",
        );
        return;
      }
      Quagga.start();

      // ステータスを更新
      if (!isUserBarcodeRead) {
        updateStatus("準備完了", "学籍番号を入力してください", 0, "active");
      } else {
        updateStatus(
          "ユーザー認証済み",
          "書籍のバーコードをスキャンしてください",
          50,
          "waiting",
        );
      }
    },
  );

  Quagga.onDetected((result) => {
    if (result.codeResult.code) {
      Quagga.offDetected(); // 一時的に検出を停止
      handleBarcodeDetected(result.codeResult.code);
    }
  });
}

/**
 * 手入力バーコード処理の初期化
 */
function initializeManualBarcodeReader() {
  const $hiddenInput = $("#hidden-barcode-input");
  const $manualInput = $("#manual-barcode-input");

  // USBバーコードリーダー → hidden input にフォーカス
  // ただし手入力テキストボックスがアクティブな場合はフォーカスを奪わない
  $(document).on("keydown", (e) => {
    if (document.activeElement === $manualInput[0]) {
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

    if (!isUserBarcodeRead && cleanedValue.length === 10) {
      handleBarcodeDetected(cleanedValue);
      $hiddenInput.val("");
    } else if (isUserBarcodeRead && cleanedValue.length === 13) {
      handleBarcodeDetected(cleanedValue);
      $hiddenInput.val("");
    }
  });

  // 手入力テキストボックス
  // input イベントで長さチェック、確定はEnterキーも対応
  $manualInput.on("input", () => {
    const cleanedValue = cleanInputValue($manualInput.val());
    $manualInput.val(cleanedValue);

    if (!isUserBarcodeRead && cleanedValue.length === 10) {
      handleBarcodeDetected(cleanedValue);
      $manualInput.val("");
    } else if (isUserBarcodeRead && cleanedValue.length === 13) {
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

/**
 * 入力値をクリーンアップ（全角→半角変換、不要な文字を除去）
 */
function cleanInputValue(value) {
  const halfWidthValue = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );
  return halfWidthValue.replace(/[^0-9a-zA-Z]/g, "");
}

/**
 * バーコード検知時の処理
 */
function handleBarcodeDetected(resultCode) {
  if (!isUserBarcodeRead && resultCode.length === 10) {
    userBarcode = resultCode;
    isUserBarcodeRead = true;

    updateStatus(
      "ユーザー認証済み",
      "書籍のバーコードをスキャンしてください",
      50,
      "waiting",
    );
    showBarcodeInfo("user", userBarcode);

    // 少し待ってからISBN読み取りを開始
    setTimeout(() => {
      restartQuagga("ean_reader");
    }, 1000);
  } else if (isUserBarcodeRead && resultCode.length === 13) {
    isbnBarcode = resultCode;

    updateStatus(
      "処理中",
      `${currentMode === "lend" ? "貸出" : "返却"}処理を実行中...`,
      75,
      "waiting",
    );
    showBarcodeInfo("isbn", isbnBarcode);

    // 処理を実行
    processingBook(userBarcode, isbnBarcode);
  } else {
    showError("無効なバーコードです。再度スキャンしてください。");
    restartQuagga(isUserBarcodeRead ? "ean_reader" : "code_128_reader");
  }
}

/**
 * Quaggaを再起動して次のバーコードを読み取る
 */
function restartQuagga(readerType) {
  Quagga.stop();
  initializeQuagga(readerType);
}

/**
 * 本の登録処理
 */
function processingBook(userBarcode, isbnBarcode) {
  const data = {
    user_id: userBarcode,
    isbn: isbnBarcode,
  };

  fetch(`/api/book/${currentMode === "lend" ? "lend" : "return"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const json = await response.json();

      updateStatus("処理完了", "", 100, "active");

      if (response.ok && json.success) {
        showSuccess(
          `本が正常に${currentMode === "lend" ? "貸出" : "返却"}されました。`,
        );
      } else {
        // ステータスコードに応じたエラーメッセージ
        let errorMessage = json.message || "処理に失敗しました";

        if (response.status === 400) {
          errorMessage = "入力エラー: " + errorMessage;
        } else if (response.status === 404) {
          errorMessage = "データが見つかりません: " + errorMessage;
        } else if (response.status === 500) {
          errorMessage = "サーバーエラー: " + errorMessage;
        }

        showError(errorMessage);
      }

      // 2秒後にリロード
      setTimeout(() => {
        location.reload();
      }, 2000);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      updateStatus("エラー", "通信エラーが発生しました", 0, "error");
      showError("本の登録中にエラーが発生しました: " + error.message);

      // 3秒後にリロード
      setTimeout(() => {
        location.reload();
      }, 3000);
    });
}

/**
 * DOMが読み込まれてから初期化
 */
document.addEventListener("DOMContentLoaded", () => {
  // 初期状態を設定
  updateStatus("初期化中", "カメラを準備しています...", 0, "waiting");

  initializeQuagga("code_128_reader"); // 最初はユーザーカード
  initializeManualBarcodeReader(); // 手入力処理

  // モード切り替えボタンの処理
  const toggleBtn = document.getElementById("toggle-mode-btn");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      currentMode = currentMode === "lend" ? "return" : "lend";

      toggleBtn.textContent = `${currentMode === "lend" ? "貸出モード" : "返却モード"}`;

      if (!isUserBarcodeRead) {
        const modeText = currentMode === "lend" ? "貸出" : "返却";
        updateStatus(
          "準備完了",
          `${modeText}モード - 学籍番号を入力してください`,
          0,
          "active",
        );
      }
    });
  } else {
    console.error("トグルボタンが見つかりません");
  }
});
