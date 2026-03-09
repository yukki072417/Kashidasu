let currentPage = 1; // 現在のページ番号
let totalRecords = 0; // 総レコード数
let showOnlyOverdue = false; // 期限切れ本のみ表示するかどうか

$(document).ready(() => {
  LoadBooks(currentPage); // ページ読み込み時に本一覧を取得

  $("#next").on("click", () => {
    const maxPages = Math.ceil(totalRecords / 30);
    if (currentPage < maxPages) {
      currentPage++;
      LoadBooks(currentPage);
    }
  });

  $("#back").on("click", () => {
    if (currentPage > 1) {
      currentPage--;
      LoadBooks(currentPage);
    }
  });

  $("#toggle-overdue").on("click", () => {
    showOnlyOverdue = !showOnlyOverdue;
    $("#toggle-overdue").text(
      showOnlyOverdue ? "全ての本を表示" : "期限切れの本だけ表示",
    );
    LoadBooks(currentPage);
  });
});

async function LoadBooks(pageNum) {
  try {
    // 貸出情報付きのAPIを使用
    const response = await fetch(`/api/book/get/all?limit=30`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      totalRecords = data.length;
      await SetTable(data);
      UpdatePageInfo();
    } else {
      console.error("API呼び出しエラー:", response.status);
      UpdatePageInfo();
    }
  } catch (error) {
    console.error("LoadBooks エラー:", error);
    UpdatePageInfo();
  }
}

function UpdatePageInfo() {
  const maxPages = Math.max(1, Math.ceil(totalRecords / 30));
  $(".search p").text(`${currentPage}/${maxPages}`);
  $("#next").prop("disabled", currentPage >= maxPages);
  $("#back").prop("disabled", currentPage <= 1);
}

async function SetTable(data) {
  $("#table tr:gt(0)").remove();

  if (!Array.isArray(data)) data = [data];

  for (const book of data) {
    if (!book || !book.title) continue;

    const today = new Date();

    // 貸出情報をAPIから取得（既に統合済み）
    const lendDateRaw = book.loanDate || null;
    const lendDate = lendDateRaw ? new Date(lendDateRaw) : null;
    const returnDateRaw = book.returnDate || null;
    const returnDate = returnDateRaw ? new Date(returnDateRaw) : null;
    const userId = book.userId || null;

    // 期限切れフィルタ適用
    let deadlineStr = "";

    if (showOnlyOverdue && !book.isBorrowed) {
      continue; // 期限切れフィルタが有効で、貸出されていない場合はスキップ
    }

    // 行生成
    const $row = $("<tr>");
    const isbn = book.isbn;
    const bookName = book.title;
    const writter = book.author || "";

    // ステータス
    let statusText = "空き";
    let statusClass = "";

    if (book.isBorrowed) {
      if (returnDate) {
        statusText = "返却済み";
        statusClass = "returned";
      } else {
        statusText = "貸出中";
        statusClass = "borrowed";
      }
    } else {
      statusText = "空き";
      statusClass = "available";
    }

    const $statusCell = $("<td>").text(statusText).addClass(statusClass);

    // 貸出ユーザー
    const $lendingUserCell = $("<td>").text(userId || "");

    // 日付表示フォーマット
    let lendDateStr = "";
    let returnDateStr = "";

    if (lendDate && !isNaN(lendDate.getTime())) {
      const yy = String(lendDate.getFullYear()).slice(-2);
      const mm = String(lendDate.getMonth() + 1).padStart(2, "0");
      const dd = String(lendDate.getDate()).padStart(2, "0");
      lendDateStr = `${yy}/${mm}/${dd}`;
    }

    if (returnDate && !isNaN(returnDate.getTime())) {
      const yy = String(returnDate.getFullYear()).slice(-2);
      const mm = String(returnDate.getMonth() + 1).padStart(2, "0");
      const dd = String(returnDate.getDate()).padStart(2, "0");
      returnDateStr = `${yy}/${mm}/${dd}`;
    }

    const $editButton = $("<button>")
      .text("編集")
      .on("click", () => {
        const params = $.param({ isbn: isbn });
        window.location.href = `/edit?${params}`;
      });

    $row.append($("<td>").text(bookName));
    $row.append($("<td>").text(writter));
    $row.append($("<td>").text(isbn));
    $row.append($statusCell);
    $row.append($lendingUserCell);
    $row.append($("<td>").append($editButton));
    $row.append($("<td>").text(lendDateStr + "->" + deadlineStr));
    $row.append($("<td>").text(returnDateStr));

    $("#table").append($row);
  }
}
