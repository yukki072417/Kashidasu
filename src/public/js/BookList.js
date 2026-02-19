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

function LoadBooks(pageNum) {
  $.ajax({
    url: "/api/book/get",
    type: "GET",
    contentType: "application/json",
    data: JSON.stringify({
      book_num: pageNum,
      manual_search_mode: false,
    }),
    success: function (data) {
      if (data && data.length > 0) {
        totalRecords = data[0]["COUNT(isbn)"]; // COUNT(ID) -> COUNT(isbn)
        // SetTable は async なので完了を待ってから UpdatePageInfo を呼ぶ
        SetTable(data.slice(1))
          .then(() => {
            UpdatePageInfo();
          })
          .catch((err) => {
            console.error("SetTable エラー:", err);
            UpdatePageInfo(); // エラーでもページ情報は更新しておく
          });
      } else {
        // データが空の場合でもテーブルとページ情報をリセット
        totalRecords = 0;
        $("#table tr:gt(0)").remove();
        UpdatePageInfo();
      }
    },
    error: function (xhr, status, error) {
      console.error("JSONパースエラー:", error);
    },
  });
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
    if (!book || !book.title) continue; // book.book_name -> book.title

    const today = new Date();

    // --- 各本ごとの貸出日・返却期限を個別に扱う ---
    const lendDateRaw = book.loanDate || null; // book.lend_date -> book.loanDate
    const lendDate = lendDateRaw ? new Date(lendDateRaw) : null;

    // ここで期限切れフィルタを適用するため、期限（lendDate + 延長日数）を先に計算する
    let deadlineStr = "";
    let isOverdue = false;

    if (lendDate && !isNaN(lendDate.getTime())) {
      // 学籍番号は本来 book.lending_user_id などを使うべき
      const studentIdForCheck = book.userId || "1234567890"; // book.lending_user_id -> book.userId

      try {
        const result = await authAdmin(studentIdForCheck);
        console.log(result.is_admin);
        const extendDays = result.is_admin ? 21 : 14;

        const tmp = new Date(lendDate);
        tmp.setDate(tmp.getDate() + extendDays);

        const yy2 = String(tmp.getFullYear()).slice(-2);
        const mm2 = String(tmp.getMonth() + 1).padStart(2, "0");
        const dd2 = String(tmp.getDate()).padStart(2, "0");
        deadlineStr = `${yy2}/${mm2}/${dd2}`;

        // 期限切れか判定（今日の午夜と比較）
        const todayMidnight = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        isOverdue = tmp < todayMidnight;
      } catch (e) {
        console.error("authAdmin 取得失敗:", e);
        // auth失敗時のデフォルト挙動：延長14日で計算
        const tmp = new Date(lendDate);
        tmp.setDate(tmp.getDate() + 14);
        const yy2 = String(tmp.getFullYear()).slice(-2);
        const mm2 = String(tmp.getMonth() + 1).padStart(2, "0");
        const dd2 = String(tmp.getDate()).padStart(2, "0");
        deadlineStr = `${yy2}/${mm2}/${dd2}`;
        const todayMidnight = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        isOverdue = tmp < todayMidnight;
      }
    } else {
      // lendDate が無い場合は期限が不明（既存の deadline フィールドを使いたければここで処理）
      if (showOnlyOverdue) {
        // 期限情報が無いものは期限切れ対象から除外（表示しない）
        continue;
      }
    }

    // showOnlyOverdue オプションが有効で、かつ期限切れでないならスキップ
    if (showOnlyOverdue && !isOverdue) {
      continue;
    }

    // --- 行生成 ---
    const $row = $("<tr>");
    const isbn = book.isbn; // bookID -> isbn
    const bookName = book.title; // book_name -> title
    const writter = book.author || ""; // book_auther -> author

    // ステータス
    const $statusCell = $("<td>").text(
      book.isBorrowed ? "貸出中" : "空き", // book.book_is_lending -> book.isBorrowed
    );

    // 貸出ユーザー
    const $lendingUserCell = $("<td>").text(book.userId || ""); // book.lending_user_id -> book.userId
    console.log(book);

    // lendDate 表示フォーマット
    let lendDateStr = "";
    if (lendDate && !isNaN(lendDate.getTime())) {
      const yy = String(lendDate.getFullYear()).slice(-2);
      const mm = String(lendDate.getMonth() + 1).padStart(2, "0");
      const dd = String(lendDate.getDate()).padStart(2, "0");
      lendDateStr = `${yy}/${mm}/${dd}`;
    }

    const $editButton = $("<button>")
      .text("編集")
      .on("click", () => {
        const params = $.param({ isbn: isbn }); // ID: bookID -> isbn: isbn
        window.location.href = `/edit?${params}`;
      });

    $row.append($("<td>").text(bookName));
    $row.append($("<td>").text(writter));
    $row.append($("<td>").text(isbn)); // bookID -> isbn
    $row.append($statusCell);
    $row.append($lendingUserCell);
    $row.append($("<td>").append($editButton));
    $row.append($("<td>").text(lendDateStr + "->" + deadlineStr));

    $("#table").append($row);
  } // for of end
}

// リクエストを送信して、返却されるレスポンスを確認する
async function authAdmin(student_id) {
  const response = await fetch(
    `/api/admin/auth-check?student_id=${encodeURIComponent(student_id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`authAdmin HTTP error: ${response.status}`);
  }

  const json = await response.json();
  return json; // { is_admin: true/false, ... }
}
