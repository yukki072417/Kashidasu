async function ApplySettings() {
  const data = {
    user_id: $("#user-id").val(),
    user_password: $("#user-password").val(),
  };
  const response = await fetch("/settings-apply", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (json.result == "SUCCESS") alert("変更が適応されました");
}
