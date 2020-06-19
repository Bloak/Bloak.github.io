var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
canvas.style.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
canvas.style.height = canvas.style.width;
var context = canvas.getContext('2d');
var board_size = 6;
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
        this.achievement = 0;
        this.walls = [];
    }
    Board.prototype.initialize = function () {
        var home_spawn = [];
        for (var key in this.content) {
            var row = string_to_list(key)[0];
            var column = string_to_list(key)[1];
            if (row === 1 || column === 1 || row === this.size * 2 - 1 || column === this.size * 2 - 1 - Math.abs(row - this.size)) {
                home_spawn.push(key);
            }
        }
        var home_pos = shuffle(home_spawn);
        this.content[home_pos].special = 'home';
        this.content[home_pos].unit = new Unit('hero', 'player', this, home_pos);
        var home_pos_list = string_to_list(home_pos);
        var objective_pos_list = [this.size * 2 - home_pos_list[0], this.size * 2 - Math.abs(home_pos_list[0] - this.size) - home_pos_list[1]];
        var objective_pos = list_to_string(objective_pos_list);
        this.content[objective_pos].special = 'objective';
        var minion_spawn = [];
        for (var key in this.content) {
            if (neighbor(this, key, home_pos)) {
                minion_spawn.push(key);
            }
        }
        for (var minion_number = 1; minion_number <= 3; minion_number++) {
            var minion_pos = shuffle(minion_spawn);
            //console.log(minion_pos);
            this.content[minion_pos].unit = new Unit('minion', 'player', this, minion_pos);
            minion_spawn = remove(minion_spawn, minion_pos);
        }
        var bee_pos_list = [this.size, this.size];
        var bee_pos = list_to_string(bee_pos_list);
        this.content[bee_pos].unit = new Unit('bee', 'hive', this, bee_pos);
        var cocoon_spawn = [];
        for (var key in this.content) {
            if (this.content[key].unit === null && this.content[key].special === null) {
                cocoon_spawn.push(key);
            }
        }
        for (var cocoon_number = 1; cocoon_number <= 4; cocoon_number++) {
            var cocoon_pos = shuffle(cocoon_spawn);
            this.content[cocoon_pos].unit = new Unit('cocoon', 'hive', this, cocoon_pos);
            cocoon_spawn = remove(cocoon_spawn, cocoon_pos);
        }
        var sentry_spawn = [];
        for (var key in this.content) {
            if (this.content[key].unit === null && this.content[key].special === null) {
                sentry_spawn.push(key);
            }
        }
        var sentry_pos = shuffle(sentry_spawn);
        this.content[sentry_pos].special = 'sentry';
        var shelter_spawn = [];
        for (var key in this.content) {
            if (this.content[key].unit === null && this.content[key].special === null) {
                shelter_spawn.push(key);
            }
        }
        var shelter_pos = shuffle(shelter_spawn);
        this.content[shelter_pos].special = 'shelter';
        var treasure_spawn = [];
        for (var key in this.content) {
            if (this.content[key].unit === null && this.content[key].special === null) {
                treasure_spawn.push(key);
            }
        }
        var treasure_pos = shuffle(treasure_spawn);
        this.content[treasure_pos].special = 'treasure';
        for (var wall_number = 1; wall_number <= 5; wall_number++) {
            var side1 = shuffle(Object.keys(this.content));
            var neighbors = [];
            for (var key in this.content) {
                if (neighbor(this, side1, key)) {
                    neighbors.push(key);
                }
            }
            var side2 = shuffle(neighbors);
            this.walls.push([side1, side2]);
        }
        var solid_wall_spawn = [];
        for (var key in this.content) {
            if (this.content[key].unit === null && this.content[key].special === null) {
                solid_wall_spawn.push(key);
            }
        }
        var wall_pos = shuffle(solid_wall_spawn);
        for (var key in this.content) {
            if (neighbor(this, wall_pos, key)) {
                this.walls.push([wall_pos, key]);
            }
        }
    };
    Board.prototype.draw = function () {
        clear();
        for (var key in this.content) {
            this.content[key].draw();
        }
        context.font = standard_font;
        context.fillStyle = "white";
        context.fillText("Resource: " + resource.toString(), width - standard_font_size * 7, standard_font_size * 2);
        for (var key in buttons) {
            buttons[key].draw();
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
        for (var key in board.content) {
            if (board.content[key].special === 'sentry' && board.content[key].unit !== null && board.content[key].unit.owner === 'player') {
                var neighbors = [];
                for (var key1 in board.content) {
                    if (neighbor(board, key1, key)) {
                        neighbors.push(key1);
                    }
                }
                for (var index = 0; index < neighbors.length; index++) {
                    if (neighbor(board, neighbors[index], list_to_string([this.row, this.column]))) {
                        result = true;
                        return true;
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
            else {
                context.fillStyle = color_table[this.special];
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
    'cocoon': 'yellow',
    'home': '#34ebe5',
    'objective': '#eb34d5',
    'sentry': '#ff9966',
    'shelter': '#99ff99',
    'treasure': '#ffff66'
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
var resource = 0;
function start() {
    resource = 80;
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
    var skip = false;
    for (var key in buttons) {
        if (buttons[key].clicked(x, y)) {
            context.font = standard_font;
            context.fillStyle = "white";
            context.fillText("Buying: " + buttons[key].name, standard_font_size, standard_font_size * 6);
            command_recorder = buttons[key].name;
            skip = true;
        }
    }
    if (!skip) {
        var pos = position(board, x, y);
        console.log(pos);
        board.draw();
        if (pos !== undefined) {
            if (board.content[pos].special !== null) {
                context.font = standard_font;
                context.fillStyle = "white";
                context.fillText("Space: " + board.content[pos].special, standard_font_size, standard_font_size * 2);
            }
            if (board.content[pos].unit !== null) {
                context.font = standard_font;
                context.fillStyle = "white";
                context.fillText("Unit: " + board.content[pos].unit.name, standard_font_size, standard_font_size * 4);
            }
            if (command_recorder === null && pos !== undefined && board.content[pos].unit !== null && board.content[pos].unit.owner === 'player') {
                command_recorder = pos;
                board.content[pos].select_draw();
                console.log('ready to move');
            }
            else if (command_recorder !== null) {
                if (isNaN(Number(command_recorder[0]))) {
                    if (command_recorder === 'minion') {
                        if (board.content[pos].special === 'home' && board.content[pos].unit === null) {
                            board.content[pos].unit = new Unit('minion', 'player', board, pos);
                            resource -= price_table['minion'];
                        }
                    }
                    else {
                        if (board.content[pos].special === null && board.content[pos].unit !== null && board.content[pos].unit.owner === 'player') {
                            board.content[pos].special = command_recorder;
                            resource -= price_table[command_recorder];
                        }
                    }
                }
                else if (neighbor(board, pos, command_recorder) && board.content[command_recorder].unit !== null) {
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
                            if (board.content[pos].special === 'treasure') {
                                resource += randint(40);
                                board.content[pos].special = null;
                            }
                        }
                        board.draw();
                        console.log('moved');
                        if (resource > 0) {
                            resource -= 1;
                        }
                        else {
                            lose();
                            return null;
                        }
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
                    if ((board.content[pos].unit === null || board.content[pos].unit.name === 'cocoon') && (board.content[pos].special !== 'shelter')) {
                        possible_destinations.push(pos);
                    }
                    else if (board.content[pos].unit !== null && board.content[pos].unit.name === 'hero' && board.content[pos].special !== 'shelter') {
                        lose();
                        return null;
                    }
                    else if (board.content[pos].unit !== null && board.content[pos].unit.name === 'minion') {
                        var opposite_list = [string_to_list(bees[n].position)[0] * 2 - string_to_list(pos)[0], null];
                        if (string_to_list(bees[n].position)[0] === board.size) {
                            opposite_list[1] = string_to_list(bees[n].position)[1] * 2 - string_to_list(pos)[1] - 1;
                        }
                        else {
                            opposite_list[1] = string_to_list(bees[n].position)[1] * 2 - string_to_list(pos)[1];
                        }
                        var opposite = list_to_string(opposite_list);
                        if (opposite in board.content && board.content[opposite].unit !== null && board.content[opposite].unit.name === 'minion') {
                            board.content[pos].unit = null;
                            board.content[opposite].unit = null;
                            console.log('a bee killed two minions');
                        }
                    }
                }
            }
        }
        var destination = shuffle(possible_destinations);
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
    for (var index = 0; index < board.walls.length; index++) {
        if ((this.board.walls[index][0] === pos1_str && this.board.walls[index][1] === pos2_str) || (this.board.walls[index][0] === pos2_str && this.board.walls[index][1] === pos1_str)) {
            result = false;
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
    context.fillStyle = "99bbff";
    context.textAlign = "center";
    context.fillText("You win.", canvas.width / 2, canvas.height / 2);
    board = undefined;
}
function lose() {
    console.log('you lose');
    context.font = font(standard_font_size * 3);
    context.fillStyle = "#ff8080";
    context.textAlign = "center";
    context.fillText("You Lose", canvas.width / 2, canvas.height / 2);
    board = undefined;
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
var price_table = {
    'minion': 2,
    'sentry': 3,
    'shelter': 3
};
var Button = /** @class */ (function () {
    function Button(name, x, y, radius) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color_table[this.name];
        this.price = price_table[this.name];
    }
    Button.prototype.draw = function () {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.font = standard_font;
        context.fillStyle = "white";
        context.fillText(this.name + ': ' + this.price.toString() + 'R', this.x + standard_font_size, this.y);
    };
    Button.prototype.clicked = function (x, y) {
        var delta_x = Math.abs(x - this.x);
        var delta_y = Math.abs(y - this.y);
        var distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
        if (distance < this.radius) {
            return true;
        }
        else {
            return false;
        }
    };
    return Button;
}());
var buttons = [
    new Button('minion', standard_font_size * 2, width - standard_font_size * 6, standard_font_size),
    new Button('sentry', standard_font_size * 2, width - standard_font_size * 4, standard_font_size),
    new Button('shelter', standard_font_size * 2, width - standard_font_size * 2, standard_font_size)
];
