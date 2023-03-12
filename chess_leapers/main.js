const LIGHTCOLOR = rgbToHex(195, 203, 213);
const DARKCOLOR = rgbToHex(125, 135, 150);

var canvas1 = document.getElementById("canvas1");
var canvas2 = document.getElementById("canvas2");

var board_size = 8;
var movement_size = 5;

var WAZIR = leaper(0, 1);
var FERZ = leaper(1, 1);
var KNIGHT = leaper(1, 2);
var CAMEL = leaper(1, 3);
var GIRAFFE = leaper(1, 4);
var FLAMINGO = leaper(1, 6);
var ZEBRA = leaper(2, 3);
var ANTELOPE = leaper(3, 4);
var ALFIL = leaper(2, 2);
var DABBABA = leaper(0, 2);
var THREELEAPER = leaper(0, 3);
var TRIPPLEKNIGHT = leaper(6, 3);
var KING = compound(WAZIR, FERZ);
var WIZARD = compound(CAMEL, FERZ);
var MARQUIS = compound(KNIGHT, WAZIR);
var ALIBBABA = compound(DABBABA, ALFIL);
var PHOENIX = compound(WAZIR, ALFIL);
var KIRIN = compound(FERZ, DABBABA);
var ELEPHANT = compound(FERZ, ALFIL);
var CATAPULT = compound(KNIGHT, THREELEAPER);
var WILDEBEEST = compound(KNIGHT, CAMEL);
var BISON = compound(CAMEL, ZEBRA);
var FAD = compound(ALIBBABA, FERZ);
var LION = compound(FAD, MARQUIS);
var NA = compound(KNIGHT, ALFIL);
var ND = compound(KNIGHT, DABBABA);
var NF = compound(KNIGHT, FERZ);
var WD = compound(WAZIR, DABBABA);
var CHAMPION = compound(ALIBBABA, WAZIR);

var piece_movement = ZEBRA;

var max_or_min = "max";
var approximation_mode = null;


function draw_empty_board(canvas, board_size) {
    var width = canvas.width;
    var height = canvas.height;

    var ctx = canvas.getContext("2d");

    // initialize
    ctx.clearRect(0, 0, width, height);

    // draw light color background
    draw_sqaure(ctx, 0, 0, width, height, LIGHTCOLOR);

    // draw dark squares
    var square_width = canvas.width / board_size;
    for (var r = 0; r < board_size; ++r) {
        for (var c = (r + 1) % 2; c < board_size; c += 2) {
            draw_sqaure(ctx, c * square_width, r * square_width, square_width, square_width, DARKCOLOR);
        }
    }
}

function draw_board(distance_map) {
    draw_empty_board(canvas1, board_size);

    var max_distance = get_largest_distance(distance_map);

    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            var distance = distance_map[r][c];
            if (distance === 0) {
                draw_piece(canvas1, board_size, [r, c]);
            }
            else if (distance !== null) { // leave blank for null squares
                draw_distance(distance, [r, c], max_distance);
            }
        }
    }
}

function get_distances(board_size, piece_position, piece_movement) {
    // returns a n*n matrix of distances from each square to piece_position
    // 用广搜，先搜所有1，再从1搜所有2，直到断层
    var board = create_matrix(board_size);
    set_unit(board, piece_position, 0);

    function get_squares_of_distance(distance) {
        var sqaures = [];
        for (var r = 0; r < board_size; ++r) {
            for (var c = 0; c < board_size; ++c) {
                if (board[r][c] === distance) {
                    sqaures.push([r, c]);
                }
            }
        }
        return sqaures;
    }

    var distance = 0;
    while (true) {
        var starting_sqaures = get_squares_of_distance(distance);
        if (starting_sqaures.length === 0) break;

        for (var starting_sqaure of starting_sqaures) {
            var destinations = get_destinations(board_size, starting_sqaure, piece_movement);
            for (var destination of destinations) {
                if (get_unit(board, destination) === null) {
                    set_unit(board, destination, distance + 1);
                }
            }
        }

        distance += 1;
    }

    return board;
}

function analyze(morph_type = null) {
    // output format:
    // {"max": {"position": [r, c], "distance_map": _, "centrality": x}, "min": {"position": [r, c], "distance_map": _, "centrality": x}, "avg": x}

    // construct a n*n matrix of distance maps
    var distance_maps = create_matrix(board_size);
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            distance_maps[r][c] = get_distances(board_size, [r, c], piece_movement);
        }
    }

    // check connectivity by looking at the distance map with highest board coverage
    var max_coverage = {"position": null, "coverage": 0};
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            var coverage = get_board_coverage(distance_maps[r][c]);
            if (coverage > max_coverage.coverage) {
                max_coverage.position = [r, c];
                max_coverage.coverage = coverage;
            }
        }
    }

    // disregard all unreachable squares in the max coverage map
    var max_coverage_map = get_unit(distance_maps, max_coverage.position);
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            if (max_coverage_map[r][c] === null) {
                distance_maps[r][c] = null;
            }
        }
    }
    
    // get the max & min centralities
    var max_centrality = {"position": null, "distance_map": null, "centrality": 0};
    var min_centrality = {"position": null, "distance_map": null, "centrality": Infinity};
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            var distance_map = distance_maps[r][c];
            if (distance_map === null) continue;

            distance_map = morph(distance_map, morph_type);

            var centrality = get_centrality(distance_map);

            if (centrality > max_centrality.centrality) {
                max_centrality.position = [r, c];
                max_centrality.distance_map = distance_map;
                max_centrality.centrality = centrality;
            }

            if (centrality < min_centrality.centrality) {
                min_centrality.position = [r, c];
                min_centrality.distance_map = distance_map;
                min_centrality.centrality = centrality;
            }
        }
    }

    // calculate the average centrality
    var centrality_sum = 0;
    var valid_sqaures_count = 0;
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            var distance_map = distance_maps[r][c];
            if (distance_map === null) continue;

            distance_map = morph(distance_map, morph_type);

            valid_sqaures_count += 1;
            centrality_sum += get_centrality(distance_map);   
        }
    }
    var average_centrality = centrality_sum / valid_sqaures_count;

    var result = {"max": max_centrality, "min": min_centrality, "avg": average_centrality};
    return result;
}

function main() {
    draw_empty_board(canvas1, board_size);
    draw_empty_board(canvas2, movement_size);

    var analyze_result = analyze(approximation_mode);
    var map = (max_or_min === "max") ? analyze_result.max.distance_map : analyze_result.min.distance_map;
    console.log(analyze_result);
    draw_board(map);
}

main();


// passive functions
function change_movement_size(new_size) {
    movement_size = Number(new_size);
    draw_empty_board(canvas2, movement_size);
}

function change_board_size(new_size) {
    board_size = Number(new_size);
    draw_empty_board(canvas1, board_size);
}

// helper functions: render
function draw_sqaure(ctx, pos_x, pos_y, width, height, color) {
    ctx.beginPath();
    ctx.rect(pos_x, pos_y, width, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function draw_piece(canvas, board_size, position) {
    var width = canvas.width;
    var square_width = width / board_size;
    var x = position[1] * square_width;
    var y = position[0] * square_width;

    var img = document.getElementById("piece");

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, x, y, square_width, square_width);
}

function draw_distance(distance, position, max_distance) {
    // only applies to canvas1 (the board)
    // the position is discrete
    var width = canvas1.width;
    var square_width = width / board_size;
    var x = position[1] * square_width + square_width / 2;
    var y = position[0] * square_width + square_width / 2 + square_width / 20;

    var ctx = canvas1.getContext("2d");
    ctx.font = (Math.floor(square_width * (2/3))).toString() + "px serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    var text = distance.toString();
    ctx.fillStyle = rainbow(distance, max_distance);
    ctx.fillText(text, x, y);
    //ctx.strokeStyle = "grey";
    //ctx.strokeText(text, x, y);
}

// helper functions: color
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rainbow(n, max) {
    var magnifier = 300 / (Math.max(8, max));
    return 'hsl(' + (n - 1) * magnifier + ',90%,40%)';
}

// helper functions: matrix
function create_matrix(size) {
    var matrix = [];
    for (var r = 0; r < size; ++r) {
        var row = [];
        for (var c = 0; c < size; ++c) {
            row.push(null);
        }
        matrix.push(row);
    }
    return matrix;
}

function get_unit(matrix, position) {
    return matrix[position[0]][position[1]];
}

function set_unit(matrix, position, value) {
    matrix[position[0]][position[1]] = value;
}

// helper functions: piece movement
function get_destinations(board_size, piece_position, piece_movement) {
    // Where on the board can the piece leap to?
    // returns a list of possible destinations, each element is a 2-list representing an absolute position on the board.
    var destinations = [];
    piece_movement.forEach(movement => {
        var destination = vector2_add(piece_position, movement);
        if (position_inside_board(board_size, destination)) {
            destinations.push(destination);
        }
    });
    return destinations;
}

function vector2_add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function position_inside_board(board_size, position) {
    return position[0] >= 0 && position[0] < board_size && position[1] >= 0 && position[1] < board_size;
}

function get_neighbors(board_size, position, type = "king", inclusive = false) {
    var r = position[0];
    var c = position[1];

    var possible_neighbors = [];
    if (type === "king") {
        possible_neighbors = [[r, c + 1], [r, c - 1], [r + 1, c + 1], [r + 1, c], [r + 1, c - 1], [r - 1, c + 1], [r - 1, c], [r - 1, c - 1]];
    }
    else if (type === "pawn") {
        possible_neighbors = [[r + 1, c]];
    }
    else if (type === "omnipawn") {
        possible_neighbors = [[r + 1, c - 1], [r + 1, c], [r + 1, c + 1]];
    }

    var neighbors = [];
    if (inclusive) neighbors.push(position);
    for (var neighbor of possible_neighbors) {
        if (position_inside_board(board_size, neighbor)) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

// helper functions: distance map
function get_board_coverage(distance_map) {
    var squares = 0
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            if (distance_map[r][c] !== null) {
                squares += 1;
            }
        }
    }
    return squares;
}

function get_centrality(distance_map) {
    var sum = 0;
    for (var r = 0; r < board_size; ++r) {
        for (var c = 0; c < board_size; ++c) {
            var distance = distance_map[r][c];
            if (distance !== null && distance > 0) {
                sum += 1 / distance;
            }
            else if (distance === 0) {
                sum += 2;
            }
        }
    }
    return sum;
}

function morph(distance_map, type = null) {
    var size = distance_map.length;
    var new_map = create_matrix(size);
    for (var r = 0; r < size; ++r) {
        for (var c = 0; c < size; ++c) {
            var min_distance = Infinity;
            var neighbors = get_neighbors(size, [r, c], type, true);
            for (var sqaure of neighbors) {
                var distance = get_unit(distance_map, sqaure);
                if (distance !== null && distance < min_distance) {
                    min_distance = distance;
                    if (min_distance === 0 && distance_map[r][c] !== 0) {
                        min_distance = 1;
                    }
                }
            }
            new_map[r][c] = (min_distance < Infinity) ? min_distance : null;
        }
    }
    return new_map;
}

function get_largest_distance(distance_map) {
    var size = distance_map.length;

    var max_distance = 0;
    for (var r = 0; r < size; ++r) {
        for (var c = 0; c < size; ++c) {
            if (distance_map[r][c] > max_distance) {
                max_distance = distance_map[r][c];
            }
        }
    }
    return max_distance;
}

// helper functions: leaper generator
function leaper(r, c) {
    var movement;
    if (r === c) movement = new Set([[r, c], [r, -c], [-r, c], [-r, -c]]);
    else movement = new Set([[r, c], [r, -c], [-r, c], [-r, -c], [c, r], [c, -r], [-c, r], [-c, -r]]);
    return movement;
}

function compound(piece1, piece2) {
    return new Set([...piece1, ...piece2]);
}