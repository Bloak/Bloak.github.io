var width = 500;
var height = 500;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
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
                var radius = width / (size * 2 - 1) / 2;
                var x = (width / (size * 2 - 1) / 2) * (1 + Math.abs(row - size) + 2 * (column - 1));
                var y = height / 2 + (row - size) * (width / (size * 2 - 1) / 2) * Math.sqrt(3);
                this.content[list_to_string([row, column])] = new Space(row, column, radius, x, y);
            }
        }
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
    Space.prototype.draw = function () {
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
    };
    Space.prototype.specialize = function (title) {
        this.special = title;
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
        if (radius === void 0) { radius = 20; }
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
var board = new Board(4);
function start() {
    clear();
    board = new Board(4);
    board.initialize();
    board.draw();
}
var objective = false;
//click event detection
document.addEventListener("DOMContentLoaded", init, false);
function init() {
    canvas.addEventListener("mousedown", getPosition, false);
}
function getPosition(event) {
    var x = event.x;
    var y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    click_event(x, y);
}
var command_recorder = null;
function click_event(x, y) {
    console.log(x, y);
    var pos = position(board, x, y);
    console.log(pos);
    if (command_recorder === null && pos !== undefined && board.content[pos].unit !== null && board.content[pos].unit.owner === 'player') {
        command_recorder = pos;
        console.log('ready to move');
    }
    else if (command_recorder !== null) {
        if (neighbor(board, pos, command_recorder)) {
            if ((board.content[pos].unit === null) || (board.content[command_recorder].unit.name === 'hero' && board.content[pos].unit.name === 'cocoon')) {
                board.content[command_recorder].unit.move(pos);
                if (board.content[pos].unit.name === 'hero' && board.content[pos].special === 'objective') {
                    objective = true;
                    board.content[pos].special = null;
                }
                else if (board.content[pos].unit.name === 'hero' && board.content[pos].special === 'home' && objective === true) {
                    win();
                    return null;
                }
                clear();
                board.draw();
                console.log('moved');
                hive_move();
            }
        }
        command_recorder = null;
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
    clear();
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
    context.clearRect(0, 0, 500, 500);
}
function win() {
    console.log('you win');
    clear();
    context.font = "30px Comic Sans MS";
    context.fillStyle = "blue";
    context.textAlign = "center";
    context.fillText("You Win", canvas.width / 2, canvas.height / 2);
}
function lose() {
    console.log('you lose');
    clear();
    context.font = "30px Comic Sans MS";
    context.fillStyle = "red";
    context.textAlign = "center";
    context.fillText("You Lose", canvas.width / 2, canvas.height / 2);
}
function randint(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
