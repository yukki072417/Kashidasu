async function  ApplySettings() {

    const data = {
        'first_name': $('#first_name').val(),
        'last_name': $('#last_name').val()
    }
    const response = await fetch('/update-settings', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    
    if(json.result == 'SUCCESS')
      alert('変更が適応されました')

}
