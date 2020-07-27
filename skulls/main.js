function send(){
	var message = document.getElementById('input').value;
	console.log(message);
	if (message.length === 0){
		return false;
	}
	else {
		var temp = document.createElement('li');
		temp.innerHTML = message;
		document.getElementById('messages').append(temp);
		document.getElementById('input').value = '';
		return true;
	}
}