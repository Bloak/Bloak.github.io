var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
canvas.style.width = Math.min(window.innerWidth, window.innerHeight) * 0.9;
canvas.style.height = canvas.style.width;
canvas.style.marginTop = (window.innerHeight - Math.min(window.innerWidth, window.innerHeight) * 0.9) / 2;
canvas.style.marginBottom = (window.innerHeight - Math.min(window.innerWidth, window.innerHeight) * 0.9) / 2;
var context = canvas.getContext('2d');
var boardSize = 8;
var commonRadius = height / ((boardSize * 2 - 1) * Math.sqrt(3));
function font(size) {
    return size.toString() + "px Comic Sans MS";
}
function drawCircle(center, radius, color) {
    context.beginPath();
    context.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}
function drawHex(center, sideLength, color) {
    context.beginPath();
    context.moveTo(center[0] - sideLength / 2, center[1] - sideLength * (Math.sqrt(3) / 2));
    context.lineTo(center[0] + sideLength / 2, center[1] - sideLength * (Math.sqrt(3) / 2));
    context.lineTo(center[0] + sideLength, center[1]);
    context.lineTo(center[0] + sideLength / 2, center[1] + sideLength * (Math.sqrt(3) / 2));
    context.lineTo(center[0] - sideLength / 2, center[1] + sideLength * (Math.sqrt(3) / 2));
    context.lineTo(center[0] - sideLength, center[1]);
    context.closePath();
    context.fillStyle = color;
    context.fill();
}
function printText(text, center, size, color) {
    context.font = font(size);
    context.fillStyle = color;
    context.textAlign = "center";
    context.fillText(text, center[0], center[1]);
}
function clear() {
    context.clearRect(0, 0, width, height);
}
function randint(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function shuffle(list) {
    return list[randint(list.length)];
}
function remove(list, element) {
    for (var index = 0; index < list.length; index++) {
        if (list[index] === element) {
            return list.slice(0, index).concat(list.slice(index + 1, list.length));
        }
    }
    return list;
}
var player = {
    coord: [0, 0, 0],
    step: 10,
    room: 0,
    death: 0,
    sight: function () {
        return Math.floor(this.step / 5);
    }
};
var Space = /** @class */ (function () {
    function Space(center, coord) {
        this.center = [center[0], center[1]];
        this.coord = [coord[0], coord[1], coord[2]];
        this.state = 'empty';
    }
    Space.prototype.sight = function () {
        if (distance(this.coord, player.coord) <= player.sight()) {
            return true;
        }
        else {
            return false;
        }
    };
    Space.prototype.draw = function () {
        if (this.sight()) {
            if (this.state === 'empty') {
                drawHex(this.center, commonRadius, 'white');
            }
            else if (this.state === 'player') {
                drawHex(this.center, commonRadius, 'white');
                drawCircle(this.center, commonRadius / 2, 'blue');
            }
            else if (this.state === 'resource') {
                drawHex(this.center, commonRadius, 'white');
                drawCircle(this.center, commonRadius / 2, 'red');
            }
            else if (this.state === 'exit') {
                if (player.step >= 20) {
                    drawHex(this.center, commonRadius, 'white');
                }
                else {
                    drawHex(this.center, commonRadius, 'green');
                }
            }
        }
    };
    return Space;
}());
function distance(coord1, coord2) {
    return Math.max(Math.abs(coord1[0] - coord2[0]), Math.abs(coord1[1] - coord2[1]), Math.abs(coord1[2] - coord2[2]));
}
function neighbor(coord1, coord2) {
    if (distance(coord1, coord2) === 1) {
        return true;
    }
    else {
        return false;
    }
}
var board = {
    spaces: {},
    initialize: function () {
        for (var x = 1 - boardSize; x <= boardSize - 1; x++) {
            for (var y = 1 - boardSize; y <= boardSize - 1; y++) {
                if (-x - y >= 1 - boardSize && -x - y <= boardSize - 1) {
                    var w = width / 2 + y * commonRadius * 1.5;
                    var h = height / 2 - x * commonRadius * Math.sqrt(3) - y * commonRadius * Math.sqrt(3) / 2;
                    var space = new Space([w, h], [x, y, -x - y]);
                    this.spaces[JSON.stringify([x, y, -x - y])] = space;
                }
            }
        }
        this.spaces['[0,0,0]'].state = 'player';
        /*let randomNumber:number = randint(5);
        this.spaces[['[7,-7,0]', '[7,0,-7]', '[0,7,-7]', '[0,-7,7]', '[-7,7,0]', '[-7,0,7]'][randomNumber]].state = 'exit';
        this.spaces[['[5,-5,0]', '[5,0,-5]', '[0,5,-5]', '[0,-5,5]', '[-5,5,0]', '[-5,0,5]'][randomNumber]].state = 'blocked';
        */
        var emptySpaces = [];
        for (var coord in this.spaces) {
            if (this.spaces[coord].state === 'empty' && coord.includes('7')) {
                emptySpaces.push(coord);
            }
        }
        this.spaces[shuffle(emptySpaces)].state = 'exit';
        emptySpaces = [];
        for (var coord in this.spaces) {
            if (this.spaces[coord].state === 'empty') {
                emptySpaces.push(coord);
            }
        }
        this.spaces[shuffle(emptySpaces)].state = 'blocked';
        emptySpaces = [];
        for (var coord in this.spaces) {
            if (this.spaces[coord].state === 'empty') {
                emptySpaces.push(coord);
            }
        }
        for (var i = 1; i <= 10; i++) {
            var resource = shuffle(emptySpaces);
            this.spaces[resource].state = 'resource';
            remove(emptySpaces, resource);
        }
    },
    draw: function () {
        for (var coord in this.spaces) {
            this.spaces[coord].draw();
        }
        printText(player.step.toString(), [50, 50], 40, 'white');
        if (player.room > 0) {
            printText(player.room.toString(), [50, 100], 40, 'green');
        }
        if (player.death > 0) {
            printText(player.death.toString(), [50, 150], 40, 'red');
        }
    }
};
board.initialize();
board.draw();
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
function clickEvent(x, y) {
    console.log(x, y);
    for (var coord in board.spaces) {
        if (Math.pow((x - board.spaces[coord].center[0]), 2) + Math.pow((y - board.spaces[coord].center[1]), 2) < Math.pow(commonRadius, 2)) {
            console.log(coord);
            move(JSON.parse(coord));
            break;
        }
    }
}
function move(coord) {
    if (neighbor(coord, player.coord)) {
        console.log(true);
        board.spaces[JSON.stringify(player.coord)].state = 'empty';
        player.coord = coord;
        player.step -= 1;
        if (player.step < 0) {
            player.death += 1;
            player.step = 10;
            board.spaces[JSON.stringify(coord)].state = 'player';
        }
        else if (board.spaces[JSON.stringify(coord)].state === 'empty') {
            board.spaces[JSON.stringify(coord)].state = 'player';
        }
        else if (board.spaces[JSON.stringify(coord)].state === 'resource') {
            board.spaces[JSON.stringify(coord)].state = 'player';
            player.step += 5;
        }
        else if (board.spaces[JSON.stringify(coord)].state === 'blocked') {
            player.step -= 5;
            if (player.step < 0) {
                player.death += 1;
                player.step = 10;
            }
            board.spaces[JSON.stringify(coord)].state = 'player';
        }
        else if (board.spaces[JSON.stringify(coord)].state === 'exit') {
            board.initialize();
            player.coord = [0, 0, 0];
            player.room += 1;
            /*if (player.step >= 20) {
                player.step = Math.floor(player.step / 2);
            }
            else if (player.step > 10) {
                player.step = 10;
            }*/
        }
        clear();
        board.draw();
        grow();
    }
    else {
        console.log(false);
    }
}
function grow() {
    var locations = [];
    for (var coord in board.spaces) {
        if (board.spaces[coord].state === 'blocked') {
            console.log(coord);
            for (var coord2 in board.spaces) {
                if (board.spaces[coord2].state !== 'blocked' && board.spaces[coord2].state !== 'exit') {
                    if (neighbor(JSON.parse(coord), JSON.parse(coord2))) {
                        locations.push(coord2);
                    }
                }
            }
        }
    }
    var newLocation = shuffle(locations);
    console.log(newLocation);
    if (board.spaces[newLocation].state === 'player') {
        player.step -= 5;
        if (player.step < 0) {
            player.death += 1;
            player.step = 10;
        }
    }
    else {
        board.spaces[newLocation].state = 'blocked';
        clear();
        board.draw();
    }
}
