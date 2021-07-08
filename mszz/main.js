var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
canvas.style.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
canvas.style.height = canvas.style.width;
var context = canvas.getContext('2d');

function drawLine(x1, y1, x2, y2){
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

function createBoard(){
	drawLine(width/3, 0, width/3, height);
	drawLine(width*2/3, 0, width*2/3, height);
	drawLine(0, height/3, width, height/3);
	drawLine(0, height*2/3, width, height*2/3);
}

var button_size = width/12;
context.font = button_size.toString() + "px Arial";

var buttons = {
	'a': [0,0],
	'b': [0,0],
	'c': [0,0],
	'd': [0,0],
	'e': [0,0],
	'f': [0,0],
	'g': [0,0]
};

var locks = {
	'generateLocation': false,
	'generateRole': false
};

function generateLocation(){
	if (locks['generateLocation'] === false){
		createBoard();
		for (button in buttons){
			var row = Math.floor(Math.random() * 3 + 1);
			var column = Math.floor(Math.random() * 3 + 1);
			buttons[button][0] = button_size/3 + width * (column-1) / 3 + Math.random() * (width/3 - button_size);
			buttons[button][1] = button_size*2/3 + height * (row-1) / 3 + Math.random() * (height/3 - button_size);
			context.fillText(button, buttons[button][0] - button_size/3, buttons[button][1] + button_size/3);
		}
		locks['generateLocation'] = true;
	}
}

function generateRole(){
	if (locks['generateRole'] === false){
		var temp = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		var certainRoles = ['迷主','占卜师','神秘学家'];
		var uncertainRoles = ['律师','病女','窃贼','胆小鬼','画家'];
		for (index in certainRoles){
			var randomNumber = Math.floor(Math.random() * temp.length);
			document.getElementById(temp[randomNumber]).innerHTML = temp[randomNumber] + ': ' + certainRoles[index];
			temp.splice(randomNumber, 1);
		}
		for (index in temp){
			var randomNumber = Math.floor(Math.random() * uncertainRoles.length);
			document.getElementById(temp[index]).innerHTML = temp[index] + ': ' + uncertainRoles[randomNumber];
			uncertainRoles.splice(randomNumber, 1);
		}
		locks['generateRole'] = true;
	}
}

var clickMode = 'select';

canvas.addEventListener("click", getClickPosition, false);
function getClickPosition(e) {
    var parentPosition = getPosition(e.currentTarget);
    var x = e.clientX - parentPosition.x;
    var y = e.clientY - parentPosition.y;
    x *= width / parseInt(canvas.style.width.slice(0, -2));
    y *= height / parseInt(canvas.style.height.slice(0, -2));
    clickEvent(x, y);
}
function getPosition(el) {
    var xPos = 0;
    var yPos = 0;
    while (el) {
        if (el.tagName == "BODY") {
            var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = el.scrollTop || document.documentElement.scrollTop;
            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        }
        else {
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }
        el = el.offsetParent;
    }
    return {
        x: xPos,
        y: yPos
    };
}

function clear() {
    context.clearRect(0, 0, width, height);
}

function clickEvent(x, y){
	if (clickMode === 'select'){
		for (button in buttons){
			if (buttons[button][0] - button_size/3 < x && x < buttons[button][0] + button_size*2/3 && buttons[button][1] - button_size*2/3 < y && y< buttons[button][1] + button_size/3){
				context.fillStyle = 'red';
				context.fillText(button, buttons[button][0] - button_size/3, buttons[button][1] + button_size/3);
				clickMode = button;
				break;
			}
		}
	}
	else {
		buttons[clickMode] = [x, y];
		clear();
		createBoard();
		for (button in buttons){
			context.fillStyle = 'black';
			context.fillText(button, buttons[button][0] - button_size/3, buttons[button][1] + button_size/3);
		}
		clickMode = 'select';
	}
}

function roll(){
	var result = Math.floor(Math.random() * 6 + 1);
	document.getElementById('dice').innerHTML = result;
}

function restart(){
	clear();
	buttons = {
		'a': [0,0],
		'b': [0,0],
		'c': [0,0],
		'd': [0,0],
		'e': [0,0],
		'f': [0,0],
		'g': [0,0]
	};
	locks = {
		'generateLocation': false,
		'generateRole': false
	};
	for (index in buttons){
		document.getElementById(index).innerHTML = index;
	}
	document.getElementById('dice').innerHTML = '';
}