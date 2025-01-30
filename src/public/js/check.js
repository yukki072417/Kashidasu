$(document).ready(function() {
    $('#login-btn').on('click', function(event) {
        event.preventDefault(); // フォームのデフォルトの送信を防ぐ

        const id = $('#admin-id').val();
        const password = $('#admin-password').val();

        if (id === "") {
            $('#admin-id').attr('placeholder', '管理者ID  IDが入力されていません');
            $('#admin-id').addClass('warn');
        } else {
            $('#admin-id').attr('placeholder', '管理者ID');
            $('#admin-id').removeClass('warn');
        }

        if (password === "") {
            $('#admin-password').attr('placeholder', '管理者パスワード  パスワードが入力されていません');
            $('#admin-password').addClass('warn');
        } else {
            $('#admin-password').attr('placeholder', '管理者パスワード');
            $('#admin-password').removeClass('warn');
        }

        if (id !== "" && password !== "") {
            $.ajax({
                url: '/main',
                type: 'POST',
                data: {
                    admin_id: id,
                    admin_password: password
                },
                success: function(response) {
                    if (response === 'WRONG') {
                        alert('パスワードまたはIDが間違っています');
                    } else {
                        window.location.href = '/main';
                    }
                },
                error: function(xhr, status, error) {
                    console.error('エラー:', error);
                }
            });
        }
    });
});