$(document).ready(function () {
  $("form").on("submit", function (event) {
    event.preventDefault();

    const id = $("#admin-id").val();
    const password = $("#admin-password").val();

    // 管理者IDが未入力の時の処理
    if (id === "") {
      $("#admin-id").attr("placeholder", "管理者ID  IDが入力されていません");
      $("#admin-id").addClass("warn");
    } else {
      $("#admin-id").attr("placeholder", "管理者ID");
      $("#admin-id").removeClass("warn");
    }

    // 管理者Passwordが未入力の時の処理
    if (password === "") {
      $("#admin-password").attr(
        "placeholder",
        "管理者パスワード  パスワードが入力されていません",
      );
      $("#admin-password").addClass("warn");
    } else {
      $("#admin-password").attr("placeholder", "管理者パスワード");
      $("#admin-password").removeClass("warn");
    }

    if (id !== "" && password !== "") {
      $.ajax({
        url: "/api/admin/login",
        type: "POST",
        data: {
          admin_id: id,
          admin_password: password,
        },
        success: function (response) {
          console.log("APIレスポンス:", response);

          // 新しいレスポンス形式に対応
          if (response.success) {
            // ログイン成功
            showSuccess("ログインに成功しました");
            setTimeout(() => {
              window.location.href = "/main";
            }, 1000);
          } else {
            // ログイン失敗
            showError(
              "ログインに失敗しました: " +
                (response.message || "IDまたはパスワードが間違っています"),
            );
          }
        },
        error: function (xhr, status, error) {
          console.error("エラー:", error);

          // ステータスコードに応じたエラーメッセージ
          let errorMessage = "ログイン中にエラーが発生しました";

          if (xhr.status === 400) {
            errorMessage = "入力エラー: IDまたはパスワードを確認してください";
          } else if (xhr.status === 401) {
            errorMessage = "認証エラー: IDまたはパスワードが間違っています";
          } else if (xhr.status === 500) {
            errorMessage = "サーバーエラー: しばらくしてから再度お試しください";
          }

          // レスポンスボディから詳細エラーを取得
          if (xhr.responseJSON && xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
          }

          showError(errorMessage);
        },
      });
    }
  });
});
