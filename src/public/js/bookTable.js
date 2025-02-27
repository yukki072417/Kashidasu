let currentPage = 1;
let totalRecords = 0;

$(document).ready(() => {
    loadBooks(currentPage);
    
    $('#next').on('click', () => {
        const maxPages = Math.ceil(totalRecords / 30);
        if (currentPage < maxPages) {
            currentPage++;
            loadBooks(currentPage);
        }
    });

    $('#back').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadBooks(currentPage);
        }
    });
});

function loadBooks(pageNum) {
    $.ajax({
        url: '/searchBook',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "book_id": "",
            "book_num": pageNum,
            "manual_search_mode": false
        }),
        success: function(data) {
            if (data && data.length > 0) {
                totalRecords = data[0]['COUNT(ID)'];
                showTable(data.slice(1));
                updatePageInfo();
            }
        },
        error: function(xhr, status, error) {
            console.error('JSONパースエラー:', error);
        }
    });
}

function updatePageInfo() {
    const maxPages = Math.ceil(totalRecords / 30);
    $('.search p').text(`${currentPage}/${maxPages}`);
    
    $('#next').prop('disabled', currentPage >= maxPages);
    $('#back').prop('disabled', currentPage <= 1);
}

//まだ使わない
function RequestSearchBook() {
    $.ajax({
        url: '/searchBook',
        type: 'POST',
        data: JSON.stringify({
            "bookID": $('#searchBook').val(),
            "bookNum": currentPage,
            "manualSearchMode": true
        }),
        success: function(data) {

        },
        error: function(xhr, status, error) {
            console.error('JSONパースエラー:', error);
        }
    });
}

function showTable(data) {
    $('#table tr:gt(0)').remove();

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach(book => {
        if (book && book.BOOK_NAME) {
            const $row = $('<tr>');

            const bookID = book.ID;
            const bookName = book.BOOK_NAME;
            const writter = book.WRITTER;
            const IS_LENDING = book.IS_LENDING;

            $row.append($('<td>').text(bookName));
            $row.append($('<td>').text(writter));
            $row.append($('<td>').text(bookID));
            
            const $statusCell = $('<td>').text(IS_LENDING ? '貸出中' : '空き');
            if (IS_LENDING) {
                $statusCell.css('color', 'red');
            }
            $row.append($statusCell);
            
            const $editButton = $('<button>')
            .text('編集')
            .addClass('edit-btn')
            .on('click', () => {
                const params = $.param({ ID: bookID, BOOK_NAME:bookName, WRITTER:writter});
                $.ajax({
                    url: `/edit?${params}`,
                    type: 'GET',
                    contentType: 'application/json',

                    success: function(response) {
                        window.location.href = `/edit?${params}`;
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                    }
                });
            });

            $row.append($('<td>').append($editButton));
            $('#table').append($row);
        }
    });
}