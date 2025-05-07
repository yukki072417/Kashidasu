let currentPage = 1;
let totalRecords = 0;

$(document).ready(() => {
    LoadBooks(currentPage);
    
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

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach(book => {
        if (book && book.book_name) {
            const $row = $('<tr>');

            const bookID = book.book_id;
            const bookName = book.book_name;
            const writter = book.book_auther;
            const isLending = book.book_is_lending;
            const lendingUser = book.lending_user_id;

            $row.append($('<td>').text(bookName));
            $row.append($('<td>').text(writter));
            $row.append($('<td>').text(bookID));
            
            const $statusCell = $('<td>').text(isLending ? '貸出中' : '空き');
            const $lendingUserCell = $('<td>').text(lendingUser);
            if (isLending) {
                $lendingUserCell.css('color', 'red');
                $statusCell.css('color', 'red');
            }
            else $lendingUserCell.text('空き');
            
            $row.append($statusCell);
            $row.append($lendingUserCell);

            const $editButton = $('<button>')
                .text('編集')
                .addClass('edit-btn')
                .on('click', () => {
                    const params = $.param({ ID: bookID });
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