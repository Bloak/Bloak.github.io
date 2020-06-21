var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
canvas.style.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
canvas.style.height = canvas.style.width;
var context = canvas.getContext('2d');
var board_size;
var standard_side_length;
var black_number;
var white_number;
var size_input = document.getElementById('size');
var white_input = document.getElementById('white');
var black_input = document.getElementById('black');
size_input.value = 7;
white_input.value = 3;
black_input.value = 3;
var standard_font_size = width / 40;
function font(size) {
    return size.toString() + "px Comic Sans MS";
}
var standard_font = font(standard_font_size);
var start_button = document.getElementById('start');
start_button.style.fontSize = window.innerWidth / 40;
start_button.style.textAlign = 'center';
var tutorial_button = document.getElementById('tutorial');
tutorial_button.style.fontSize = window.innerWidth / 40;
tutorial_button.style.textAlign = 'center';
function list_to_string(pos) {
    return pos[0].toString() + '_' + pos[1].toString();
}
function string_to_list(pos) {
    return [parseInt(pos.slice(0, pos.indexOf('_'))), parseInt(pos.slice(pos.indexOf('_') + 1, pos.length))];
}
var Board = /** @class */ (function () {
    function Board() {
        this.size = board_size;
        this.content = {};
        for (var row = 1; row <= this.size; row++) {
            for (var column = 1; column <= this.size; column++) {
                var x = standard_side_length * (column - 1);
                var y = standard_side_length * (row - 1);
                this.content[list_to_string([row, column])] = new Space(row, column, standard_side_length, x, y);
            }
        }
    }
    Board.prototype.initialize = function () {
        var objective_spawn = Object.keys(this.content);
        var black_objective = shuffle(objective_spawn);
        this.content[black_objective].special = 'black objective';
        objective_spawn = remove(objective_spawn, black_objective);
        var white_objective = shuffle(objective_spawn);
        this.content[white_objective].special = 'white objective';
        objective_spawn = remove(objective_spawn, white_objective);
        var white_small;
        for (var i = 1; i <= white_number; i++) {
            white_small = shuffle(objective_spawn);
            this.content[white_small].unit = new Unit('white small', this, white_small, 'white', 0.25);
            objective_spawn = remove(objective_spawn, white_small);
        }
        var black_small;
        for (var i = 1; i <= black_number; i++) {
            black_small = shuffle(objective_spawn);
            this.content[black_small].unit = new Unit('black small', this, black_small, 'black', 0.25);
            objective_spawn = remove(objective_spawn, black_small);
        }
        var white_large = shuffle(objective_spawn);
        this.content[white_large].unit = new Unit('white large', this, white_large, 'white', 0.5);
        objective_spawn = remove(objective_spawn, white_large);
        var black_large = shuffle(objective_spawn);
        this.content[black_large].unit = new Unit('black large', this, black_large, 'black', 0.5);
        objective_spawn = remove(objective_spawn, black_large);
    };
    Board.prototype.draw = function () {
        if (!lost) {
            clear();
            for (var key in this.content) {
                this.content[key].draw();
            }
        }
    };
    Board.prototype.apply_force_once = function () {
        var temp_Obj = this.get_small_positions();
        console.log('black');
        for (var k in temp_Obj['black']) {
            var skip = false;
            var key = temp_Obj['black'][k];
            var row = string_to_list(key)[0];
            var column = string_to_list(key)[1];
            console.log(key);
            for (var r = 1; r <= this.size; r++) {
                if (this.content[list_to_string([r, column])].unit !== null && this.content[list_to_string([r, column])].unit.name === 'black large') {
                    if (r < row) {
                        this.content[key].unit.move('bottom');
                        skip = true;
                        break;
                    }
                    else if (r > row) {
                        this.content[key].unit.move('top');
                        skip = true;
                        break;
                    }
                }
                else if (this.content[list_to_string([r, column])].unit !== null && this.content[list_to_string([r, column])].unit.name === 'white large') {
                    if (r < row) {
                        this.content[key].unit.move('top');
                        skip = true;
                        break;
                    }
                    else if (r > row) {
                        this.content[key].unit.move('bottom');
                        skip = true;
                        break;
                    }
                }
            }
            if (!skip) {
                for (var c = 1; c <= this.size; c++) {
                    if (this.content[list_to_string([row, c])].unit !== null && this.content[list_to_string([row, c])].unit.name === 'black large') {
                        if (c < column) {
                            this.content[key].unit.move('right');
                            break;
                        }
                        else if (c > column) {
                            this.content[key].unit.move('left');
                            break;
                        }
                    }
                    else if (this.content[list_to_string([row, c])].unit !== null && this.content[list_to_string([row, c])].unit.name === 'white large') {
                        if (c < column) {
                            this.content[key].unit.move('left');
                            break;
                        }
                        else if (c > column) {
                            this.content[key].unit.move('right');
                            break;
                        }
                    }
                }
            }
            console.log('over');
        }
        console.log('white');
        for (var k in temp_Obj['white']) {
            var skip = false;
            var key = temp_Obj['white'][k];
            var row = string_to_list(key)[0];
            var column = string_to_list(key)[1];
            console.log(key);
            for (var r = 1; r <= this.size; r++) {
                if (this.content[list_to_string([r, column])].unit !== null && this.content[list_to_string([r, column])].unit.name === 'white large') {
                    if (r < row) {
                        this.content[key].unit.move('bottom');
                        skip = true;
                        break;
                    }
                    else if (r > row) {
                        this.content[key].unit.move('top');
                        skip = true;
                        break;
                    }
                }
                else if (this.content[list_to_string([r, column])].unit !== null && this.content[list_to_string([r, column])].unit.name === 'black large') {
                    if (r < row) {
                        this.content[key].unit.move('top');
                        skip = true;
                        break;
                    }
                    else if (r > row) {
                        this.content[key].unit.move('bottom');
                        skip = true;
                        break;
                    }
                }
            }
            if (!skip) {
                for (var c = 1; c <= this.size; c++) {
                    if (this.content[list_to_string([row, c])].unit !== null && this.content[list_to_string([row, c])].unit.name === 'white large') {
                        if (c < column) {
                            this.content[key].unit.move('right');
                            break;
                        }
                        else if (c > column) {
                            this.content[key].unit.move('left');
                            break;
                        }
                    }
                    else if (this.content[list_to_string([row, c])].unit !== null && this.content[list_to_string([row, c])].unit.name === 'black large') {
                        if (c < column) {
                            this.content[key].unit.move('left');
                            break;
                        }
                        else if (c > column) {
                            this.content[key].unit.move('right');
                            break;
                        }
                    }
                }
            }
            console.log('over');
        }
        this.draw();
        for (var key in this.content) {
            if (this.content[key].unit !== null) {
                this.content[key].unit.moved = false;
            }
        }
    };
    Board.prototype.get_small_positions = function () {
        var small_positions = {
            'black': [],
            'white': []
        };
        for (var key in this.content) {
            if (this.content[key].unit !== null) {
                if (this.content[key].unit.name === 'black small') {
                    small_positions['black'].push(key);
                }
                else if (this.content[key].unit.name === 'white small') {
                    small_positions['white'].push(key);
                }
            }
        }
        return small_positions;
    };
    Board.prototype.apply_force = function () {
        while (true) {
            var temp_obj = this.get_small_positions();
            console.log(temp_obj);
            this.apply_force_once();
            if ((list_equal(this.get_small_positions()['black'], temp_obj['black'])) && (list_equal(this.get_small_positions()['white'], temp_obj['white']))) {
                break;
            }
        }
    };
    Board.prototype.win_detect = function () {
        if (this.get_small_positions()['black'].length === 0 && this.get_small_positions()['white'].length === 0) {
            win();
        }
    };
    return Board;
}());
var Space = /** @class */ (function () {
    function Space(row, column, side_length, x, y) {
        this.unit = null;
        this.row = row;
        this.column = column;
        this.side_length = side_length;
        this.x = x;
        this.y = y;
        this.special = null;
    }
    Space.prototype.draw = function () {
        context.strokeRect(this.x, this.y, this.side_length, this.side_length);
        if (this.special === 'black objective') {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.side_length, this.side_length);
        }
        else if (this.special === 'white objective') {
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.side_length, this.side_length);
        }
        if (this.unit !== null) {
            this.unit.draw(this.x + this.side_length * 0.5, this.y + this.side_length * 0.5);
        }
    };
    Space.prototype.select_draw = function () {
        context.strokeRect(this.x, this.y, this.side_length, this.side_length);
        context.fillStyle = 'yellow';
        context.fillRect(this.x, this.y, this.side_length, this.side_length);
        if (this.unit !== null) {
            this.unit.draw(this.x + this.side_length * 0.5, this.y + this.side_length * 0.5);
        }
    };
    return Space;
}());
var Unit = /** @class */ (function () {
    function Unit(name, board, position, color, ratio) {
        if (ratio === void 0) { ratio = 0.5; }
        this.name = name;
        this.board = board;
        this.position = position;
        this.color = color;
        this.radius = standard_side_length * ratio;
        this.moved = false;
    }
    Unit.prototype.move = function (direction) {
        if (!this.moved) {
            var position_list = string_to_list(this.position);
            if (direction === 'left') {
                position_list[1] -= 1;
            }
            else if (direction === 'right') {
                position_list[1] += 1;
            }
            else if (direction === 'top') {
                position_list[0] -= 1;
            }
            else if (direction === 'bottom') {
                position_list[0] += 1;
            }
            var new_position = list_to_string(position_list);
            console.log(direction, new_position);
            if (new_position in this.board.content) {
                if ((this.name === 'white small' && this.board.content[new_position].special === 'black objective') || (this.name === 'black small' && this.board.content[new_position].special === 'white objective')) {
                    this.color = 'red';
                    this.board.content[this.position].draw();
                    lose();
                    return null;
                }
                else if ((this.name === 'white small' && this.board.content[new_position].special === 'white objective') || (this.name === 'black small' && this.board.content[new_position].special === 'black objective')) {
                    this.board.content[this.position].unit = null;
                    this.name = null;
                    this.position = null;
                }
                else if ((this.name === 'white small' && this.board.content[new_position].unit !== null && this.board.content[new_position].unit.name === 'black small') || (this.name === 'black small' && this.board.content[new_position].unit !== null && this.board.content[new_position].unit.name === 'white small')) {
                    this.color = 'red';
                    this.board.content[this.position].draw();
                    lose();
                    return null;
                }
                else if (this.board.content[new_position].unit === null) {
                    this.board.content[this.position].unit = null;
                    this.position = new_position;
                    this.board.content[new_position].unit = this;
                    this.moved = true;
                    this.board.draw();
                }
            }
        }
    };
    Unit.prototype.command_move = function (new_position) {
        if (this.name === 'black large' || this.name === 'white large') {
            if (new_position in this.board.content && neighbor(this.position, new_position)) {
                if (this.board.content[new_position].unit === null && this.board.content[new_position].special === null) {
                    this.board.content[this.position].unit = null;
                    this.position = new_position;
                    this.board.content[new_position].unit = this;
                }
            }
        }
        this.board.draw();
    };
    Unit.prototype.draw = function (x, y) {
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    };
    return Unit;
}());
var board = new Board();
var lost = false;
function start() {
    lost = false;
    board_size = parseInt(size_input.value);
    standard_side_length = width / board_size;
    white_number = parseInt(white_input.value);
    black_number = parseInt(black_input.value);
    board = new Board();
    board.initialize();
    board.draw();
}
canvas.addEventListener("click", getClickPosition, false);
function getClickPosition(e) {
    var parentPosition = getPosition(e.currentTarget);
    var x = e.clientX - parentPosition.x;
    var y = e.clientY - parentPosition.y;
    x *= width / parseInt(canvas.style.width.slice(0, -2));
    y *= height / parseInt(canvas.style.height.slice(0, -2));
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
var command_recorder = null;
function click_event(x, y) {
    var pos = position(x, y);
    console.log(pos);
    if (command_recorder === null && board.content[pos].unit !== null && (board.content[pos].unit.name === 'black large' || board.content[pos].unit.name === 'white large')) {
        command_recorder = pos;
        board.content[command_recorder].select_draw();
    }
    else if (command_recorder !== null) {
        board.content[command_recorder].unit.command_move(pos);
        command_recorder = null;
        board.apply_force();
        if (!lost) {
            board.win_detect();
        }
    }
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
function win() {
    console.log('you win');
    context.font = font(standard_font_size * 2);
    context.fillStyle = "#99bbff";
    context.textAlign = "center";
    context.fillText("You win.", canvas.width / 2, canvas.height / 2);
    board = undefined;
}
function lose() {
    lost = true;
    console.log('you lose');
    context.font = font(standard_font_size * 3);
    context.fillStyle = "#ff8080";
    context.textAlign = "center";
    context.fillText("You Lose", canvas.width / 2, canvas.height / 2);
    board = undefined;
}
function neighbor(pos1, pos2) {
    var result = false;
    var pos1_list = string_to_list(pos1);
    var pos2_list = string_to_list(pos2);
    if (pos1_list[0] === pos2_list[0] && (pos1_list[1] === pos2_list[1] + 1 || pos1_list[1] === pos2_list[1] - 1)) {
        result = true;
    }
    else if (pos1_list[1] === pos2_list[1] && (pos1_list[0] === pos2_list[0] + 1 || pos1_list[0] === pos2_list[0] - 1)) {
        result = true;
    }
    return result;
}
function list_equal(list1, list2) {
    if (list1.length !== list2.length) {
        return false;
    }
    for (var key in list1) {
        if (list1[key] !== list2[key]) {
            return false;
        }
    }
    return true;
}
function position(x, y) {
    var row = Math.floor(y / standard_side_length) + 1;
    var column = Math.floor(x / standard_side_length) + 1;
    return list_to_string([row, column]);
}
