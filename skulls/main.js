function send() {
    var message = document.getElementById('input').value;
    console.log(message);
    operate(message);
}
function announce(content) {
    var temp = document.createElement('li');
    temp.innerHTML = content;
    document.getElementById('messages').append(temp);
}
function randint(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function draw(deck) {
    return deck[randint(deck.length)];
}
function remove(list, element) {
    for (var index = 0; index < list.length; index++) {
        if (list[index] === element) {
            return list.slice(0, index).concat(list.slice(index + 1, list.length));
        }
    }
    return list;
}
function inlist(list, element) {
    for (var index = 0; index < list.length; index++) {
        if (list[index] === element) {
            return true;
        }
    }
    return false;
}
var poker_deck = [];
for (var i = 1; i <= 4; i++) {
    for (var j = 1; j <= 13; j++) {
        poker_deck.push(j);
    }
}
console.log(poker_deck);
var Player = /** @class */ (function () {
    function Player(number, identity) {
        this.number = number;
        this.hand = [];
        this.front = [];
        this.identity = identity;
        this.claim = null;
    }
    Player.prototype.draw_card = function () {
        for (var i = 1; i <= 4; i++) {
            var card = draw(poker_deck);
            poker_deck = remove(poker_deck, card);
            this.hand.push(card);
        }
    };
    Player.prototype.start_turn = function () {
        if (this.identity === 'player') {
            if (this.front.length === 0 || state === 'play_card') {
                announce('请出牌');
                state = 'play_card';
            }
            else if (state === 'follow') {
                announce('你想揭示几张牌？不及下限视为放弃');
            }
            else if (state === 'give_up') {
                announce('你已经放弃');
            }
            else {
                announce('请选择：1.出牌；2.宣布结算');
                state = 'choice';
            }
        }
        else {
            announce('玩家' + this.number.toString() + '出牌');
            end_turn();
        }
    };
    return Player;
}());
var players = [];
var player_id = randint(4) + 1;
for (var i = 1; i <= 4; i++) {
    var temp = void 0;
    if (i === player_id) {
        temp = new Player(i, 'player');
    }
    else {
        temp = new Player(i, 'ai');
    }
    temp.draw_card();
    players.push(temp);
}
announce('你是' + player_id.toString() + '号玩家。');
announce('你的手牌是：' + players[player_id - 1].hand.toString());
var state = '';
var current_player = 1;
players[current_player - 1].start_turn();
function end_turn() {
    if (current_player < 4) {
        current_player++;
    }
    else {
        current_player = 1;
    }
    players[current_player - 1].start_turn();
}
function operate(msg) {
    if (state === 'choice') {
        if (parseInt(msg) === 1) {
            state = 'play_card';
            document.getElementById('input').value = '';
            players[player_id - 1].start_turn();
        }
        else if (parseInt(msg) === 2) {
            state = 'follow';
            document.getElementById('input').value = '';
            players[player_id - 1].start_turn();
        }
        else {
            announce('无效输入');
        }
    }
    if (state === 'play_card') {
        if (!isNaN(parseInt(msg))) {
            var card = parseInt(msg);
            if (inlist(players[player_id - 1].hand, card)) {
                players[player_id - 1].hand = remove(players[player_id - 1].hand, card);
                players[player_id - 1].front.push(card);
                announce('你打出了：' + card.toString());
                announce('你的手牌是：' + players[player_id - 1].hand.toString());
                state = '';
                document.getElementById('input').value = '';
                end_turn();
            }
            else {
                announce('你没有这张牌');
            }
        }
        else {
            announce('无效输入');
        }
    }
}
