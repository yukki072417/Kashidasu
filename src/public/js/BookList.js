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
        $('#toggle-overdue').text(showOnlyOverdue ? '全ての本を表示' : '期限切れ本だけ表示');
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
            const deadlineRaw = book.deadline;
            const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

            if (showOnlyOverdue) {
                if (!deadline || isNaN(deadline.getTime()) || deadline >= today) return;
            }

            const $row = $('<tr>');

            const bookID = book.book_id;
            const bookName = book.book_name;
            const writter = book.book_auther;
            const isLending = book.book_is_lending;
            const lendingUser = book.lending_user_id;
            const lendDateRaw = book.lend_date;

            let lendDate = null;
            let $lendDateCell = null;

            if (lendDateRaw) {
                const d = new Date(lendDateRaw);
                const yy = String(d.getFullYear()).slice(-2);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                lendDate = `${yy}/${mm}/${dd}`;

                const d2 = new Date(d);

                // 図書委員は21日、それ以外は14日
                const extendDays = book.is_admin ? 21 : 14;
                d2.setDate(d2.getDate() + extendDays);

                const yy2 = String(d2.getFullYear()).slice(-2);
                const mm2 = String(d2.getMonth() + 1).padStart(2, '0');
                const dd2 = String(d2.getDate()).padStart(2, '0');
                const lendDatePlusDeadline = `${yy2}/${mm2}/${dd2}`;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                d2.setHours(0, 0, 0, 0);
                
                $lendDateCell = $('<td>').text(`${lendDate} → ${lendDatePlusDeadline}`);
                if (d2.getTime() === today.getTime()) {
                    $lendDateCell.css('color', 'red');
                }
            }

            const $statusCell = $('<td>').text(isLending ? '貸出中' : '空き');
            const $lendingUserCell = $('<td>').text(lendingUser);
            if (isLending) {
                $lendingUserCell.css('color', 'red');
                $statusCell.css('color', 'red');
            } else {
                $lendingUserCell.text('空き');
            }

            const $editButton = $('<button>')
                .text('編集')
                .addClass('edit-btn')
                .on('click', () => {
                    const params = $.param({ ID: bookID });
                    window.location.href = `/edit?${params}`;
                });

            $row.append($('<td>').text(bookName));
            $row.append($('<td>').text(writter));
            $row.append($('<td>').text(bookID));
            $row.append($statusCell);
            $row.append($lendingUserCell);
            $row.append($('<td>').append($editButton));
            if ($lendDateCell) $row.append($lendDateCell);

            $('#table').append($row);
        }
    });
}
