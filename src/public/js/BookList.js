let currentPage = 1; // 現在のページ番号
let totalRecords = 0; // 総レコード数
let showOnlyOverdue = false; // 期限切れ本のみ表示するかどうか

$(document).ready(() => {
    LoadBooks(currentPage); // ページ読み込み時に本一覧を取得

    // 「次へ」ボタンのクリックイベント
    $('#next').on('click', () => {
        const maxPages = Math.ceil(totalRecords / 30);
        if (currentPage < maxPages) {
            currentPage++;
            LoadBooks(currentPage);
        }
    });

    // 「戻る」ボタンのクリックイベント
    $('#back').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            LoadBooks(currentPage);
        }
    });

    // 期限切れ表示切替ボタンのクリックイベント
    $('#toggle-overdue').on('click', () => {
        showOnlyOverdue = !showOnlyOverdue;
        if (showOnlyOverdue) {
            $('#toggle-overdue').text('全ての本を表示');
        } else {
            $('#toggle-overdue').text('期限切れ本だけ表示');
        }
        LoadBooks(currentPage);
    });
});

// 本一覧をサーバーから取得する関数
function LoadBooks(pageNum) {
    $.ajax({
        url: '/search-book',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            'book_num': pageNum,
            'manual_search_mode': false
        }),
        success: function(data) {
            if (data && data.length > 0) {
                totalRecords = data[0]['COUNT(ID)']; // 総レコード数を取得
                SetTable(data.slice(1)); // テーブルに本データをセット
                UpdatePageInfo(); // ページ情報を更新
            }
        },
        error: function(xhr, status, error) {
            console.error('JSONパースエラー:', error);
        }
    });
}

// ページ情報（現在のページ/最大ページ）を表示・ボタンの有効/無効を切り替える関数
function UpdatePageInfo() {
    const maxPages = Math.ceil(totalRecords / 30);
    $('.search p').text(`${currentPage}/${maxPages}`);

    $('#next').prop('disabled', currentPage >= maxPages);
    $('#back').prop('disabled', currentPage <= 1);
}

// 本データをテーブルに表示する関数
function SetTable(data) {
    $('#table tr:gt(0)').remove(); // 既存の本データ行を削除（ヘッダー以外）

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach(book => {
        if (book && book.book_name) {
            const today = new Date();
            const deadlineRaw = book.deadline;
            const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

            // 期限切れだけ表示モードの場合、期限切れ本以外は表示しない
            if (showOnlyOverdue) {
                if (!deadline || isNaN(deadline.getTime()) || deadline >= today) return;
            }

            const $row = $('<tr>'); // 新しい行を作成

            // 本の各情報を取得
            const bookID = book.book_id;
            const bookName = book.book_name;
            const writter = book.book_auther;
            const isLending = book.book_is_lending;
            const lendingUser = book.lending_user_id;
            const lendDateRaw = book.lend_date;

            let lendDate = null;
            let $lendDateCell = null;
            if (lendDateRaw) {
                // 貸出日がある場合、日付を「yy/mm/dd」形式に変換
                const d = new Date(lendDateRaw);
                const yy = String(d.getFullYear()).slice(-2);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                lendDate = `${yy}/${mm}/${dd}`;

                // 2週間後の日付を計算
                const d2 = new Date(d);
                d2.setDate(d2.getDate() + 14);
                const yy2 = String(d2.getFullYear()).slice(-2);
                const mm2 = String(d2.getMonth() + 1).padStart(2, '0');
                const dd2 = String(d2.getDate()).padStart(2, '0');
                const lendDatePlus2Weeks = `${yy2}/${mm2}/${dd2}`;

                // 今日の日付（時刻を無視）
                const today = new Date();
                today.setHours(0,0,0,0);
                d2.setHours(0,0,0,0);

                // 「貸出日 → 2週間後」の形式で表示
                $lendDateCell = $('<td>').text(`${lendDate} → ${lendDatePlus2Weeks}`);
                // 返却期限が今日の場合は赤色で表示
                if (d2.getTime() === today.getTime()) {
                    $lendDateCell.css('color', 'red');
                }
            }

            // 貸出状況を表示
            const $statusCell = $('<td>').text(isLending ? '貸出中' : '空き');
            const $lendingUserCell = $('<td>').text(lendingUser);
            if (isLending) {
                // 貸出中の場合は赤色で表示
                $lendingUserCell.css('color', 'red');
                $statusCell.css('color', 'red');
            }
            else {
                $lendingUserCell.text('空き');
            }

            // 編集ボタンを作成
            const $editButton = $('<button>')
                .text('編集')
                .addClass('edit-btn')
                .on('click', () => {
                    const params = $.param({ ID: bookID });
                    window.location.href = `/edit?${params}`;
                });

            // 行に各セルを追加
            $row.append($('<td>').text(bookName));         // 本のタイトル
            $row.append($('<td>').text(writter));          // 著者
            $row.append($('<td>').text(bookID));           // 本ID
            $row.append($statusCell);                      // 貸出状況
            $row.append($lendingUserCell);                 // 貸出ユーザー
            $row.append($('<td>').append($editButton));    // 編集ボタン
            if ($lendDateCell) $row.append($lendDateCell); // 貸出日→返却期限

            // テーブルに行を追加
            $('#table').append($row);
        }
    });
}