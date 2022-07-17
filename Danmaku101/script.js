const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

var player = null;
var enemies = [];
var generators = [];
var regenGlobes = [];
var regenGlobeGenerator = null;
var keyGenerator = null;
var level = 1;

var hue = Math.random() * 360;

var particlesArray = [];

var inGame = true;
var pause = false;
var selecting = false;

var mouseDown = false;

var upgradeButtons = [];

let images = {
    "regenGlobe": null,
    "bomb": null,
    "inc_radius": null,
    "inc_bomb_time": null, 
    "dec_bomb_cd": null,
    "inc_hp": null, 
    "dec_size": null, 
    "inc_globe_gen": null, 
    "inc_speed": null,
    "inc_atk_speed": null
};
for (let img in images){
    images[img] = document.getElementById(img);
}

class Vector2 {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    copy(){
        return new Vector2(this.x, this.y)
    }
    add(v2){
        this.x += v2.x;
        this.y += v2.y;
    }
    scale(c){
        this.x *= c;
        this.y *= c;
    }
    to(v2){
        return new Vector2(v2.x - this.x, v2.y - this.y);
    }
    norm(){
        return Math.hypot(this.x, this.y);
    }
    normalize(newNorm){
        var scale = newNorm / this.norm();
        return new Vector2(this.x * scale, this.y * scale);
    }
}

function drawCircle(color, center, radius){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawHealthBar(ratio){
    ctx.lineWidth = 1;
    ctx.fillStyle = `hsl(${ratio * 120}, 100%, 50%)`;
    ctx.fillRect(20, 20, ratio * 150, 20);
    ctx.beginPath();
    ctx.rect(20, 20, 150, 20);
    ctx.strokeStyle = "white";
    ctx.stroke();
}

function drawFan(center, radius, ratio, color, ccw = true){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, - Math.PI / 2, - Math.PI / 2 - Math.PI * 2 * ratio, ccw);
    ctx.closePath();
    ctx.fill();
}

function drawBombButton(ratio){
    //drawCircle("red", new Vector2(230, 40), 20);
    ctx.drawImage(images["bomb"], 210, 20, 40, 40);
    drawFan(new Vector2(230, 40), 20, ratio, "rgba(255,255,255,0.75)");
}

canvas.addEventListener("mousedown", function(event){
    mouseDown = true;
});

canvas.addEventListener("mouseup", function(event){
    if (mouseDown){
        mouseDown = false;
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        clickEvent(new Vector2(x, y));
    }
});

canvas.addEventListener("mousemove", function(event){
    if (mouseDown){
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        clickEvent(new Vector2(x, y));
    }
});

document.addEventListener("keyup", function(event){
    if (event.key === "z" && inGame){
        pauseGame();
    }
});

document.addEventListener("keydown", function(event){
    if (event.key === "x" && inGame && !pause){
        if (player.bombAvailable()){
            player.castBomb();
        }
    }
});

function clickEvent(pos){
    if (inGame){
        if (pause) {
            if (!selecting) resume();
            else {
                // check if button clicked
                for (let i = 0; i < upgradeButtons.length; ++i){
                    if (upgradeButtons[i].clicked(pos)) {
                        upgradeButtons[i].onclick();
                        // resume the game & finish upgrading
                        player.upgrade();
                        addDanmakuGenerator();
                        upgradeButtons = [];
                        selecting = false;
                        resume();
                        break;
                    }
                }
            }
        }
        else{
            clickEffect(pos);
            player.headTo(pos);
        }
    }
    else{
        restart();
    }
}

function clickEffect(pos){
    for (let i = 0; i < 6; ++i){
        particlesArray.push(new Particle(pos));
    }
}

class Particle {
    constructor(pos){
        this.pos = pos.copy();
        this.size = Math.random() * 3 + 1;
        this.velocity = new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }
    update(){
        this.pos.add(this.velocity);
        if (this.size > 0.2) this.size -= 0.1;
    }
    render(){
        drawCircle(`hsl(${hue},100%,50%)`, this.pos, this.size);
    }
}

function handleParticles(){
    for (let i = 0; i < particlesArray.length; ++i){
        particlesArray[i].update();
        particlesArray[i].render();
        if (particlesArray[i].size <= 0.3){
            particlesArray.splice(i, 1);
            i -= 1;
        }
    }
}

function clear(){
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function halfClear(){
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Player {
    constructor(){
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.pos = new Vector2(canvas.width / 2, canvas.height / 2);
        this.radius = 9;
        this.destination = this.pos;
        this.velocity = new Vector2(0, 0);
        this.maxSpeed = 1;
        this.bombCD = 0;
        this.bombMaxCD = 1200;
        this.bombEffectRemaining = 0;
        this.maxBombEffect = 120;
        this.bombRadius = 30; // also the attack range
        this.attackCD = 0;
        this.attackMaxCD = 30;
        this.attackNumber = 0;
    }
    headTo(pos){
        this.destination = pos;
        this.velocity = this.pos.to(this.destination).normalize(this.maxSpeed);
    }
    move(){
        this.pos.add(this.velocity);
    }
    attack(){
        let targets = new Array(this.attackNumber).fill({"index": -1, "distance": Infinity}); //first one is the closest
        for (let i = 0; i < enemies.length; ++i){
            let distance = this.pos.to(enemies[i].pos).norm();
            if (distance <= this.bombRadius){
                for (let j = 0; j < targets.length; ++j){
                    if (distance < targets[j].distance){
                        targets.splice(j, 0, {"index": i, "distance": distance});
                        targets.pop();
                        break;
                    }
                }
            }
        }
        for (let j = 0; j < targets.length; ++j){
            let index = targets[j].index;
            if (index === -1) break;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(enemies[index].pos.x, enemies[index].pos.y);
            ctx.strokeStyle = "white";
            ctx.stroke();
            this.attackCD = this.attackMaxCD;
        }
        for (let j = 0; j < targets.length; ++j){
            let index = targets[j].index;
            if (index === -1) break;
            enemies.splice(index - j, 1);
        }
    }
    update(){
        this.move();
        // arrive at destination
        if (this.pos.to(this.destination).norm() <= this.maxSpeed / 2){
            this.velocity = new Vector2(0, 0);
        }
        this.bombCD = Math.max(this.bombCD - 1, 0);
        this.bombEffectRemaining  = Math.max(this.bombEffectRemaining - 1, 0);
        this.attackCD = Math.max(this.attackCD - 1, 0);
        if (this.attackCD === 0){
            this.attack();
        }
    }
    render(){
        drawCircle(`hsl(${hue},100%,50%)`, this.pos, 10);
        drawCircle("white", this.pos, this.radius);
        if (this.bombEffectOn()) drawCircle("rgba(255,0,0,0.1)",this.pos, this.bombRadius);
        drawHealthBar(this.health / this.maxHealth);
        drawBombButton(this.bombCD / this.bombMaxCD);
    }
    takeDamage(damage){
        this.health -= damage;
        if (this.health <= 0){
            this.health = 0;
            endGame();
        }
    }
    bombAvailable(){
        return this.bombCD === 0;
    }
    castBomb(){
        this.bombCD = this.bombMaxCD;
        this.bombEffectRemaining = this.maxBombEffect;
    }
    bombEffectOn(){
        return this.bombEffectRemaining > 0;
    }
    getBombRadius(){
        return this.bombRadius;
    }
    restoreHealth(){
        this.health = Math.min(this.health + this.maxHealth * 0.1, this.maxHealth);
    }
    upgrade(){
        //upgrade
        this.attackNumber += 1;
        this.bombEffectRemaining = 120;
        this.health = this.maxHealth;
        this.bombCD = 0;
    }
}

class Danmaku {
    constructor(pos, velocity, radius, color, accel = new Vector2(0, 0)){
        this.pos = pos.copy();
        this.velocity = velocity.copy();
        this.radius = radius;
        this.color = color;
        this.accel = accel.copy();
    }
    damage(){
        return Math.min(this.radius + this.velocity.norm(), 50);
    }
    move(){
        this.velocity.add(this.accel);
        this.pos.add(this.velocity);
    }
    update(){
        this.move();
        var destroySelf = false;
        // hit player
        if (this.pos.to(player.pos).norm() < this.radius + player.radius) {
            player.takeDamage(this.damage());
            destroySelf = true;
        }
        // hit bomb
        if (player.bombEffectOn() && this.pos.to(player.pos).norm() < this.radius + player.getBombRadius()) {
            destroySelf = true;
        }
        // out of screen
        if (this.pos.to(new Vector2(canvas.width / 2, canvas.height / 2)).norm() > canvas.width * 0.75 + this.radius){
            destroySelf = true;
        }
        return destroySelf;
    }
    render(){
        drawCircle(this.color, this.pos, this.radius);
    }
}

class DanmakuGenerator {
    constructor(){

    }
    update(){
        if (Math.random() < 0.1) this.generate();
    }
    generate(){
        enemies.push(new Danmaku(new Vector2(0, 0), new Vector2(Math.random(), Math.random()), Math.random() * 5 + 1, "yellow"));
    }
}

class StraightLineDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
    }
    generate(){
        let aim = new Vector2(Math.random() * canvas.width, Math.random() * canvas.height);
        let origin = randomBorderOrigin();
        let speed = Math.random() + 0.2;
        let velocity = origin.to(aim).normalize(speed);
        let radius = Math.random() * 5 + 2;
        enemies.push(new Danmaku(origin, velocity, radius, "white"));
    }
}

function randomBorderOrigin(scale = 1){
    let origin = new Vector2(0, 0);
    let locator = Math.random() * canvas.width;
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            origin.x = locator;
            break;
        case 1:
            origin.x = canvas.width;
            origin.y = locator;
            break;
        case 2:
            origin.x = locator;
            origin.y = canvas.height;
            break;
        case 3:
            origin.y = locator;
    }
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var fromCenter = center.to(origin);
    fromCenter = fromCenter.normalize(fromCenter.norm() * scale);
    center.add(fromCenter);
    origin = center;
    return origin;
}

class HomingStraightLineDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
        this.sourceAngle = Math.PI / 4;
        this.sourceAngleSpeed = Math.random() * 0.05 + 0.02;
        this.maxCountDown = Math.floor(this.sourceAngleSpeed * 200);
        this.countDown = this.maxCountDown;
    }
    source(){
        let radius = canvas.width * 0.75;
        let result = new Vector2(canvas.width / 2, canvas.height / 2);
        result.add(new Vector2(radius * Math.cos(this.sourceAngle), radius * Math.sin(this.sourceAngle)));
        return result;
    }
    update(){
        this.sourceAngle += this.sourceAngleSpeed;

        this.countDown -= 1;
        if (this.countDown === 0) {
            this.countDown = this.maxCountDown;
            this.generate();
        }
    }
    generate(){
        let speed = this.sourceAngleSpeed * 20;
        let velocity = this.source().to(player.pos).normalize(speed);
        let radius = 3;
        enemies.push(new Danmaku(this.source(), velocity, radius, "yellow"));
    }
}

class HomingDanmaku extends Danmaku {
    constructor(pos, speed, radius, generator){
        super(pos, new Vector2(0, 0), radius, null);
        this.speed = speed;
        this.generator = generator;
    }
    update(){
        this.velocity = this.pos.to(player.pos).normalize(this.speed);
        var destroySelf = super.update();
        if (destroySelf) this.generator.decreaseDanmaku();
        return destroySelf;
    }
    render(){
        // black with white border
        drawCircle("white", this.pos, this.radius);
        drawCircle("black", this.pos, this.radius * 0.9);
    }
}

class HomingDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
        this.danmakuCount = 0;
        this.danmakuCap = 10;
    }
    update(){
        if (Math.random() < 0.01 && this.danmakuCount < this.danmakuCap) this.generate();
    }
    generate(){
        let origin = randomBorderOrigin(1.2);
        let speed = 0.25;
        let radius = Math.random() * 30 + 20;
        enemies.push(new HomingDanmaku(origin, speed, radius, this));
        this.danmakuCount += 1;
    }
    decreaseDanmaku(){
        this.danmakuCount -= 1;
    }
}

class WaveSource {
    constructor(center, initialVel, accelConstant){
        this.pos = center.copy();
        this.center = center.copy();
        this.velocity = initialVel.copy();
        this.accelConstant = accelConstant;
    }
    update(){
        let accel = this.pos.to(this.center);
        accel.scale(this.accelConstant);
        this.velocity.add(accel);
        this.pos.add(this.velocity);
    }
}

class WaveDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
        this.sources = [];
        let initialVel = Math.random() * 19 + 1;
        for (let i = 0; i < 5; ++i){
            this.sources.push(new WaveSource(new Vector2(0, canvas.height * i / 4), new Vector2(0, initialVel), initialVel / 500));
        }
        this.maxCountDown = 20;
        this.countDown = this.maxCountDown;
    }
    update(){
        this.sources.forEach(source => {
            source.update();
        });
        this.countDown -= 1;
        if (this.countDown === 0){
            this.countDown = this.maxCountDown;
            this.generate();
        }
    }
    generate(){
        this.sources.forEach(source => {
            enemies.push(new Danmaku(source.pos, new Vector2(Math.random() + 0.2, Math.random() * 0.2 - 0.1).normalize(1.5), 3, "blue"));
        });
    }
}

class FallingDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
    }
    update(){
        if (Math.random() < 0.2) this.generate();
    }
    generate(){
        let origin = new Vector2(Math.random() * canvas.width, -10);
        let velocity = new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1);
        let radius = Math.random() * 5 + 2;
        let accel = new Vector2(0, 0.01);
        enemies.push(new Danmaku(origin, velocity, radius, "rgb(0,255,50)", accel));
    }
}

class FireworkDanmakuGenerator extends DanmakuGenerator {
    constructor(){
        super();
        this.sourceAngle = Math.PI / 4;
        this.sourceAngleSpeed = Math.random() * 0.06 + 0.01;
    }
    source(){
        let radius = canvas.width * 0.375;
        let result = new Vector2(canvas.width / 2, canvas.height / 2);
        result.add(new Vector2(radius * Math.cos(this.sourceAngle), radius * Math.sin(this.sourceAngle)));
        return result;
    }
    update(){
        this.sourceAngle += this.sourceAngleSpeed;

        if (Math.random() < 0.05) this.generate();
    }
    generate(){
        for (let i = 0; i < 6; ++i){
            enemies.push(new Danmaku(this.source(), new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1), Math.random() * 3 + 2, "#ec80ff"));
        }
    }
}

class RegenGlobe {
    constructor(pos){
        this.pos = pos.copy();
        this.radius = 10;
        this.initialCountDown = 1200;
        this.countDown = this.initialCountDown;
    }
    update(){
        var destroySelf = false;
        // grabbed by player or its bomb
        if ((this.pos.to(player.pos).norm() < this.radius + player.radius) || (player.bombEffectOn() && this.pos.to(player.pos).norm() < this.radius + player.getBombRadius())) {
            player.restoreHealth();
            destroySelf = true;
        }
        // countdown
        this.countDown -= 1;
        if (this.countDown <= 0){
            destroySelf = true;
        }
        return destroySelf;
    }
    render(){
        //drawCircle("red", this.pos, this.radius);
        ctx.drawImage(images["regenGlobe"], this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, this.radius * 2);
        drawFan(this.pos, this.radius, this.countDown / this.initialCountDown, "rgba(0,0,0,0.75)", false);
    }
}

class RegenGlobeGenerator {
    constructor(){
        this.p = 0.005;
    }
    update(){
        if (Math.random() < this.p) this.generate();
    }
    generate(){
        regenGlobes.push(new RegenGlobe(new Vector2(Math.random() * canvas.width, Math.random() * canvas.height)));
    }
}

class Key {
    constructor(pos){
        this.pos = pos.copy();
        this.radius = 10;
    }
    update(){
        var destroySelf = false;
        // grabbed by player
        if (this.pos.to(player.pos).norm() < this.radius + player.radius) {
            nextLevel();
            destroySelf = true;
        }
        return destroySelf;
    }
    render(){
        drawCircle("white", this.pos, this.radius);
    }
}

class KeyGenerator {
    constructor(){
        this.maxCountDown = 1800;
        this.countDown = this.maxCountDown;
        this.key = null;
    }
    update(){
        if (this.key === null){
            this.countDown -= 1;
            if (this.countDown === 0) {
                this.countDown = this.maxCountDown;
                this.generate();
            }
        }
        else {
            if (this.key.update()){
                this.key = null;
            }
        }
    }
    generate(){
        let keyPos = null;
        while (true){
            keyPos = new Vector2(Math.random() * canvas.width, Math.random() * canvas.height);
            if (keyPos.to(player.pos).norm() > canvas.width / 2) break;
        }
        this.key = new Key(keyPos);
    }
    render(){
        if (this.key !== null) this.key.render();
    }
}

class Button {
    constructor(center, width, height, img, onclick){
        this.center = center.copy();
        this.width = width;
        this.height = height;
        this.img = img;
        this.onclick = onclick;
    }
    render(){
        ctx.drawImage(this.img, this.center.x - this.width / 2, this.center.y - this.height / 2, this.width, this.height);
    }
    clicked(pos){
        return pos.x < this.center.x + this.width / 2 && pos.x > this.center.x - this.width / 2 && pos.y < this.center.y + this.height / 2 && pos.y > this.center.y - this.height / 2;
    }
}

function init(){
    player = new Player();
    addDanmakuGenerator();
    regenGlobeGenerator = new RegenGlobeGenerator();
    keyGenerator = new KeyGenerator();
}
init();

function addDanmakuGenerator(){
    let generatorCollection = [StraightLineDanmakuGenerator, HomingStraightLineDanmakuGenerator, HomingDanmakuGenerator, WaveDanmakuGenerator, FallingDanmakuGenerator, FireworkDanmakuGenerator];
    let newGenerator = generatorCollection[Math.floor(Math.random() * generatorCollection.length)];
    generators.push(new newGenerator());
}

function animate(){
    handleParticles();
    update();
    render();
    if (!pause){
        requestAnimationFrame(animate);
    }
}
animate();

function nextLevel(){
    level += 1;

    pauseGame();
    selecting = true;

    var upgrades = [];
    upgrades.push({"name": "inc_radius", "effect": ()=>{player.bombRadius += 20;}});
    if (player.maxBombEffect + 60 < player.bombMaxCD - 120) {
        upgrades.push({"name": "inc_bomb_time", "effect": ()=>{player.maxBombEffect += 60;}});
        upgrades.push({"name": "dec_bomb_cd", "effect": ()=>{player.bombMaxCD -= 120;}});
    }
    upgrades.push({"name": "inc_hp", "effect": ()=>{player.health += 50;}});
    if (player.radius > 2) {
        upgrades.push({"name": "dec_size", "effect": ()=>{player.radius -= 2;}});
    }
    if (regenGlobeGenerator.p < 1) {
        upgrades.push({"name": "inc_globe_gen", "effect": ()=>{regenGlobeGenerator.p += 0.005;}});
    }
    upgrades.push({"name": "inc_speed", "effect": ()=>{player.maxSpeed += 0.5;}});
    if (player.attackMaxCD > 6) {
        upgrades.push({"name": "inc_atk_speed", "effect": ()=>{player.attackMaxCD -= 5;}});
    }

    var choices = random_select(upgrades, 2);

    upgradeButtons = [new Button(new Vector2(150, 250), 100, 100, images[choices[0].name], choices[0].effect), new Button(new Vector2(350, 250), 100, 100, images[choices[1].name], choices[1].effect)];
}

function update(){
    if (inGame) {
        hue += 1;
        player.update();
        for (var i = 0; i < enemies.length; ++i){
            if (enemies[i].update()){
                enemies.splice(i, 1);
                i -= 1;
            }
        }
        for (var i = 0; i < generators.length; ++i){
            generators[i].update();
        }
        for (var i = 0; i < regenGlobes.length; ++i){
            if (regenGlobes[i].update()){
                regenGlobes.splice(i, 1);
                i -= 1;
            }
        }
        regenGlobeGenerator.update();
        keyGenerator.update();
    }
}

function render(){
    halfClear();

    player.render();
    for (var i = 0; i < regenGlobes.length; ++i){
        regenGlobes[i].render();
    }
    keyGenerator.render();
    for (var i = 0; i < enemies.length; ++i){
        enemies[i].render();
    }

    if (!inGame) displayGameOverText();

    if (pause) {
        clear();
        if (!selecting) displayPauseText();
        else displayUpgradeButtons();
    }
}

function displayGameOverText(){
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", 250, 220);
    ctx.font = "15px Arial";
    ctx.fillText("click anywhere to restart", 250, 250);
}

function displayPauseText(){
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Pause", 250, 220);
    ctx.font = "15px Arial";
    ctx.fillText("click anywhere to resume", 250, 250);
}

function displayUpgradeButtons(){
    upgradeButtons.forEach((button)=>{
        button.render();
    });
}

function endGame(){
    inGame = false;
    mouseDown = false;
}

function restart(){
    inGame = true;
    player = null;
    enemies = [];
    generators = [];
    particlesArray = [];
    regenGlobes = [];
    regenGlobeGenerator = null;
    keyGenerator = null;
    level = 1;
    init();
}

function pauseGame(){
    pause = true;
    mouseDown = false;
}

function resume(){
    pause = false;
    animate();
}

function random(a, b) {
	return Math.floor(Math.random()*(b-a)+a);
}

function random_select_index(n, r) {
	// randomly select r distinct integers from [0, n)
	if (r > n) return null;
	var results = []; // t_his is sorted in incrementing order
	for (var i = 0; i < r; ++i) {
		var num = random(0, n-i);
		if (results.length == 0) {
			results.push(num);
		}
		else {
			var inserted = false;
			for (var j = 0; j < results.length; ++j) {
				if (num >= results[j]) {
					num += 1;
				}
				else {
					results.splice(j, 0, num);
					inserted = true;
					break;
				}
			}
			if (!inserted) {
				results.push(num);
			}
		}
	}
	return results;
}

function random_select(ls, r) {
	if (r > ls.length) return null;
	var indices = random_select_index(ls.length, r);
	return indices.map(i => ls[i]);
}