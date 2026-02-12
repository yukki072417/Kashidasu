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
        url: "/main",
        type: "POST",
        data: {
          admin_id: id,
          admin_password: password,
        },
        success: function (response) {
          console.log(response.result);
          if (response.result == "FAILED") {
            alert("パスワードまたはIDが間違っています");
          } else {
            window.location.href = "/main";
          }
        },
        error: function (xhr, status, error) {
          console.error("エラー:", error);
        },
      });
    }
  });
});
