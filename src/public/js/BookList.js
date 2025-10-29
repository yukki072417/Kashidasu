let currentPage = 1; // 現在のページ番号
let totalRecords = 0; // 総レコード数
let showOnlyOverdue = false; // 期限切れ本のみ表示するかどうか

$(document).ready(() => {

    LoadBooks(currentPage); // ページ読み込み時に本一覧を取得

    $('#next').on('click', () => {
        const maxPages = Math.ceil(totalRecords / 30);
        if (currentPage < maxPages) {
            currentPage++;
            LoadBooks(currentPage);
        }
    });

    $('#back').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            LoadBooks(currentPage);
        }
    });

    $('#toggle-overdue').on('click', () => {
        showOnlyOverdue = !showOnlyOverdue;
        $('#toggle-overdue').text(showOnlyOverdue ? '全ての本を表示' : '期限切れの本だけ表示');
        LoadBooks(currentPage);
    });
});

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
                totalRecords = data[0]['COUNT(ID)'];
                SetTable(data.slice(1));
                UpdatePageInfo();
            }
        },
        error: function(xhr, status, error) {
            console.error('JSONパースエラー:', error);
        }
    });
}

function UpdatePageInfo() {
    const maxPages = Math.ceil(totalRecords / 30);
    $('.search p').text(`${currentPage}/${maxPages}`);
    $('#next').prop('disabled', currentPage >= maxPages);
    $('#back').prop('disabled', currentPage <= 1);
}

function SetTable(data) {
    $('#table tr:gt(0)').remove();

    if (!Array.isArray(data)) data = [data];

    data.forEach(book => {
        if (book && book.book_name) {
            const today = new Date();

            // --- 各本ごとの貸出日・返却期限を個別に扱う ---
            const lendDateRaw = book.lend_date || null;
            const deadlineRaw = book.deadline || null;

            const lendDate = lendDateRaw ? new Date(lendDateRaw) : null;
            const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

            // 「期限切れのみ表示」オプションが有効なとき
            if (showOnlyOverdue) {
                if (!deadline || isNaN(deadline.getTime()) || deadline >= today) {
                    // 期限がない or 未到来 → 表示しない
                    return;
                }
            }

            const $row = $('<tr>');
            const bookID = book.book_id;
            const bookName = book.book_name;
            const writter = book.book_auther || '';

            // ステータス
            const $statusCell = $('<td>').text(book.book_is_lending ? '貸出中' : '在庫');

            // 貸出ユーザー
            const $lendingUserCell = $('<td>').text(book.lending_user_id || '');

            // --- 日付表示 ---
            let lendDateStr = '';
            if (lendDate && !isNaN(lendDate.getTime())) {
                const yy = String(lendDate.getFullYear()).slice(-2);
                const mm = String(lendDate.getMonth() + 1).padStart(2, '0');
                const dd = String(lendDate.getDate()).padStart(2, '0');
                lendDateStr = `${yy}/${mm}/${dd}`;
            }

            let deadlineStr = '';
            if (deadline && !isNaN(deadline.getTime())) {
                const yy = String(deadline.getFullYear()).slice(-2);
                const mm = String(deadline.getMonth() + 1).padStart(2, '0');
                const dd = String(deadline.getDate()).padStart(2, '0');
                deadlineStr = `${yy}/${mm}/${dd}`;
                console.log(deadline);
            } else if (lendDate && !isNaN(lendDate.getTime())) {
                // サーバが deadline を返さない場合の補助計算（14日後 or 21日後）
                const tmp = new Date(lendDate);
                const extendDays = book.is_admin ? 21 : 14;
                tmp.setDate(tmp.getDate() + extendDays);
                const yy = String(tmp.getFullYear()).slice(-2);
                const mm = String(tmp.getMonth() + 1).padStart(2, '0');
                const dd = String(tmp.getDate()).padStart(2, '0');
                deadlineStr = `${yy}/${mm}/${dd}`;
            }

            // --- 行生成 ---
            const $editButton = $('<button>').text('編集').on('click', () => {
                const params = $.param({ ID: bookID });
                window.location.href = `/edit?${params}`;
            });

            $row.append($('<td>').text(bookName));
            $row.append($('<td>').text(writter));
            $row.append($('<td>').text(bookID));
            $row.append($statusCell);
            $row.append($lendingUserCell);
            $row.append($('<td>').text(lendDateStr));
            $row.append($('<td>').text(deadlineStr));
            $row.append($('<td>').append($editButton));

            $('#table').append($row);
        }
    });
}


// リクエストを送信して、返却されるレスポンスを確認する Wed/29/10
async function test(){
    
    const response = await fetch('https://localhost/admin-auth', {
        method: 'GET',
        headers: 'Content-Type: Application/json'
    });
    
    console.log(response.json());
}
test();