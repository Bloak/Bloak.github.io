var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.6;
canvas.height = window.innerWidth * 0.6;
var width = canvas.width;
var height = canvas.height;
var board_size = 4;
var standard_radius = width / (board_size * 2 - 1) / 2;
var standard_font_size = width / 40;
function font(size) {
    return size.toString() + "px Comic Sans MS";
}
var standard_font = font(standard_font_size);
/*const start_button: any = document.getElementById('start');
if (screen.width < 800) {
    start_button.style.width = 0.4 * screen.width;
    start_button.style.marginLeft = 0.3 * screen.width;
    start_button.style.marginRight = 0.3 * screen.width;
}*/
//[x, y] <--> 'x_y' conversion
function list_to_string(pos) {
    return pos[0].toString() + '_' + pos[1].toString();
}
function string_to_list(pos) {
    return [parseInt(pos.slice(0, pos.indexOf('_'))), parseInt(pos.slice(pos.indexOf('_') + 1, pos.length))];
}
var Board = /** @class */ (function () {
    function Board(size) {
        this.size = size;
        this.content = {};
        var row;
        var column;
        for (row = 1; row <= size * 2 - 1; row++) {
            for (column = 1; column <= size * 2 - 1 - Math.abs(row - size); column++) {
                var radius = standard_radius;
                var x = (width / (size * 2 - 1) / 2) * (1 + Math.abs(row - size) + 2 * (column - 1));
                var y = height / 2 + (row - size) * (width / (size * 2 - 1) / 2) * Math.sqrt(3);
                this.content[list_to_string([row, column])] = new Space(row, column, radius, x, y);
            }
        }
        this.step = 0;
        this.achievement = 0;
    }
    Board.prototype.initialize = function () {
        this.content['4_1'].special = 'home';
        this.content['4_7'].special = 'objective';
        this.content['4_1'].unit = new Unit('hero', 'player', this, '4_1');
        this.content['3_1'].unit = new Unit('minion', 'player', this, '3_1');
        this.content['4_2'].unit = new Unit('minion', 'player', this, '4_2');
        this.content['5_1'].unit = new Unit('minion', 'player', this, '5_1');
        this.content['4_4'].unit = new Unit('bee', 'hive', this, '4_4');
        this.content['1_1'].unit = new Unit('cocoon', 'hive', this, '1_1');
        this.content['1_4'].unit = new Unit('cocoon', 'hive', this, '1_4');
        this.content['7_1'].unit = new Unit('cocoon', 'hive', this, '7_1');
        this.content['7_4'].unit = new Unit('cocoon', 'hive', this, '7_4');
    };
    Board.prototype.draw = function () {
        clear();
        for (var key in this.content) {
            this.content[key].draw();
        }
    };
    return Board;
}());
var Space = /** @class */ (function () {
    function Space(row, column, radius, x, y) {
        this.unit = null;
        this.row = row;
        this.column = column;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.special = null;
    }
    Space.prototype.visible = function () {
        var result = false;
        for (var row = 1; row <= board.size * 2 - 1; row++) {
            for (var column = 1; column <= board.size * 2 - 1 - Math.abs(row - board.size); column++) {
                if ((row === this.row && column === this.column) || neighbor(board, list_to_string([row, column]), list_to_string([this.row, this.column]))) {
                    if (board.content[list_to_string([row, column])].unit !== null && board.content[list_to_string([row, column])].unit.owner === 'player') {
                        result = true;
                        return result;
                    }
                    if (board.content[list_to_string([row, column])].special === 'home') {
                        result = true;
                        return result;
                    }
                }
            }
        }
        return result;
    };
    Space.prototype.draw = function () {
        if (this.visible()) {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            if (this.special === null) {
                context.fillStyle = 'white';
            }
            else if (this.special === 'home') {
                context.fillStyle = '#34ebe5';
            }
            else if (this.special === 'objective') {
                context.fillStyle = '#eb34d5';
            }
            context.fill();
            if (this.unit !== null) {
                this.unit.draw(this.x, this.y);
            }
        }
    };
    Space.prototype.select_draw = function () {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#ffff99';
        context.fill();
        if (this.unit !== null) {
            this.unit.draw(this.x, this.y);
        }
    };
    return Space;
}());
var color_table = {
    'hero': 'blue',
    'minion': 'green',
    'bee': 'red',
    'cocoon': 'yellow'
};
var Unit = /** @class */ (function () {
    function Unit(name, owner, board, position, radius) {
        if (radius === void 0) { radius = standard_radius * 0.5; }
        this.name = name;
        this.owner = owner;
        this.board = board;
        this.position = position;
        this.color = color_table[this.name];
        this.radius = radius;
    }
    Unit.prototype.move = function (new_position) {
        this.board.content[this.position].unit = null;
        this.position = new_position;
        this.board.content[new_position].unit = this;
    };
    Unit.prototype.draw = function (x, y) {
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = color_table[this.name];
        context.fill();
    };
    return Unit;
}());
//initialize
var board = new Board(board_size);
function start() {
    board = new Board(board_size);
    board.initialize();
    board.draw();
}
//click event detection
canvas.addEventListener("click", getClickPosition, false);
function getClickPosition(e) {
    var parentPosition = getPosition(e.currentTarget);
    var x = e.clientX - parentPosition.x;
    var y = e.clientY - parentPosition.y;
    click_event(x, y);
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
/*document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas.addEventListener("mousedown", getPosition, false);
}

function getPosition(event) {
    let x: number = event.x;
    let y: number = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    click_event(x, y);
}*/
var command_recorder = null;
function click_event(x, y) {
    console.log(x, y);
    var pos = position(board, x, y);
    console.log(pos);
    board.draw();
    if (board.content[pos].special !== null) {
        context.font = standard_font;
        context.fillStyle = "white";
        //context.textAlign = "center";
        context.fillText("Space: " + board.content[pos].special, standard_font_size, standard_font_size);
    }
    if (board.content[pos].unit !== null) {
        context.font = standard_font;
        context.fillStyle = "white";
        //context.textAlign = "center";
        context.fillText("Unit: " + board.content[pos].unit.name, standard_font_size, standard_font_size * 3);
    }
    if (command_recorder === null && pos !== undefined && board.content[pos].unit !== null && board.content[pos].unit.owner === 'player') {
        command_recorder = pos;
        board.content[pos].select_draw();
        console.log('ready to move');
    }
    else if (command_recorder !== null) {
        if (neighbor(board, pos, command_recorder)) {
            if ((board.content[pos].unit === null) || (board.content[command_recorder].unit.name === 'hero' && board.content[pos].unit.name === 'cocoon')) {
                if (board.content[command_recorder].unit.name === 'hero' && board.content[pos].special === 'objective') {
                    board.achievement += 1;
                    board.content[pos].special = null;
                    board.content[pos].unit = new Unit('hero', 'player', board, pos);
                }
                else {
                    board.content[command_recorder].unit.move(pos);
                    if (board.content[pos].unit.name === 'hero' && board.content[pos].special === 'home' && board.achievement >= 1) {
                        board.achievement += 1;
                        board.content[pos].unit = null;
                    }
                }
                board.draw();
                console.log('moved');
                board.step += 1;
                if (board.achievement === 3) {
                    win();
                    return null;
                }
                hive_move();
            }
        }
        command_recorder = null;
        board.draw();
    }
}
function hive_move() {
    var bees = [];
    for (var row = 1; row <= board.size * 2 - 1; row++) {
        for (var column = 1; column <= board.size * 2 - 1 - Math.abs(row - board.size); column++) {
            if (board.content[list_to_string([row, column])].unit !== null && board.content[list_to_string([row, column])].unit.name === 'bee') {
                bees.push(board.content[list_to_string([row, column])].unit);
            }
        }
    }
    for (var n = 0; n < bees.length; n++) {
        var possible_destinations = [];
        for (var row = 1; row <= board.size * 2 - 1; row++) {
            for (var column = 1; column <= board.size * 2 - 1 - Math.abs(row - board.size); column++) {
                var pos = list_to_string([row, column]);
                if (neighbor(board, bees[n].position, pos)) {
                    if (board.content[pos].special === 'home') {
                        lose();
                        return null;
                    }
                    if (board.content[pos].unit === null || board.content[pos].unit.name === 'cocoon') {
                        possible_destinations.push(pos);
                    }
                    else if (board.content[pos].unit.name === 'hero') {
                        lose();
                        return null;
                    }
                }
            }
        }
        var destination = possible_destinations[randint(possible_destinations.length)];
        if (board.content[destination].unit === null) {
            bees[n].move(destination);
        }
        else if (board.content[destination].unit.name === 'cocoon') {
            board.content[destination].unit = new Unit('bee', 'hive', board, destination);
        }
    }
    board.draw();
}
function position(board, x, y) {
    for (var row = 1; row <= board.size * 2 - 1; row++) {
        for (var column = 1; column <= board.size * 2 - 1 - Math.abs(row - board.size); column++) {
            if (Math.sqrt(Math.pow((board.content[list_to_string([row, column])].x - x), 2) + Math.pow((board.content[list_to_string([row, column])].y - y), 2)) < board.content[list_to_string([row, column])].radius) {
                return list_to_string([row, column]);
            }
        }
    }
    return undefined;
}
function neighbor(board, pos1_str, pos2_str) {
    var result = false;
    var pos1 = string_to_list(pos1_str);
    var pos2 = string_to_list(pos2_str);
    if (pos1[0] === pos2[0]) {
        if ((pos1[1] === pos2[1] + 1) || (pos1[1] === pos2[1] - 1)) {
            result = true;
        }
    }
    else if (pos1[0] === pos2[0] + 1) {
        if (pos1[0] <= board.size) {
            if ((pos1[1] === pos2[1]) || (pos1[1] === pos2[1] + 1)) {
                result = true;
            }
        }
        else if ((pos1[1] === pos2[1]) || (pos1[1] === pos2[1] - 1)) {
            result = true;
        }
    }
    else if (pos1[0] === pos2[0] - 1) {
        if (pos1[0] < board.size) {
            if ((pos1[1] === pos2[1]) || (pos1[1] === pos2[1] - 1)) {
                result = true;
            }
        }
        else if ((pos1[1] === pos2[1]) || (pos1[1] === pos2[1] + 1)) {
            result = true;
        }
    }
    return result;
}
function clear() {
    context.clearRect(0, 0, width, height);
}
function win() {
    console.log('you win');
    context.font = font(standard_font_size * 2);
    context.fillStyle = "blue";
    context.textAlign = "center";
    context.fillText("You win. You took " + board.step.toString() + " steps.", canvas.width / 2, canvas.height / 2);
    board = undefined;
}
function lose() {
    console.log('you lose');
    context.font = font(standard_font_size * 3);
    context.fillStyle = "red";
    context.textAlign = "center";
    context.fillText("You Lose", canvas.width / 2, canvas.height / 2);
    board = undefined;
}
function randint(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
