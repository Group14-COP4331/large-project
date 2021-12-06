function buildPath(route)
{
    return 'https://dungeonride.herokuapp.com/' + route
}

var user = JSON.parse(localStorage.getItem('game_data'));
var userInfo = JSON.parse(localStorage.getItem('user_data'));
var leadBoar = JSON.parse(localStorage.getItem('leaderboard'));

var canvas;
var keys = [];
var bottom = 900;
var ceiling = 100;
var maps;
var scene = "menu";
var score = 0;
var name = userInfo.username;
var start;

if(user.topscore === 0)
    start = false;
else
    start = true;

var highScore = user.topscore;
var earnings = user.coins;
var store = {
    prices: [0, 1000, 2000, 3000, 4000],
    type: ["ghost", "clown", "witch", "zombie", "vamp"],
    name: ["GHOSTY", "6IX9INE", "WITCH", "ZOMBIE", "PLAYBOI\nCARTI"],
    bought: [user.assets[0], user.assets[1], user.assets[2], user.assets[3], user.assets[4]]
}, storeSwipe = 0;

var curType = "ghost";
var mapLength = 12;

// sounds
var bg1;
var rock;
var rock2;
var gameSpeed = 0;
var bgmusic;
var triangleDown;
var triangleUp;
var triangleLeft;
var triangleRight;

var scores = [
    [leadBoar[0].username, leadBoar[0].score],
    [leadBoar[1].username, leadBoar[1].score],
    [leadBoar[2].username, leadBoar[2].score],
    [leadBoar[3].username, leadBoar[3].score],
    [leadBoar[4].username, leadBoar[4].score],
    [leadBoar[5].username, leadBoar[5].score],
    [leadBoar[6].username, leadBoar[6].score],
    [leadBoar[7].username, leadBoar[7].score],
    [leadBoar[8].username, leadBoar[8].score],
    [leadBoar[9].username, leadBoar[9].score],
];

var orderedScores = scores;

function leaderboard()
{
    const leader = async event =>
    {
        try {

            var obj = {};
            var js = JSON.stringify(obj);
            const response = await fetch(buildPath('api/getLeaderboard'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            
            var resp = JSON.parse(await response.text());
            localStorage.removeItem('leaderboard');
            localStorage.setItem('leaderboard', JSON.stringify(resp.leaderboard));

            leadBoar = JSON.parse(localStorage.getItem('leaderboard'));

            scores = [
                [leadBoar[0].username, leadBoar[0].score],
                [leadBoar[1].username, leadBoar[1].score],
                [leadBoar[2].username, leadBoar[2].score],
                [leadBoar[3].username, leadBoar[3].score],
                [leadBoar[4].username, leadBoar[4].score],
                [leadBoar[5].username, leadBoar[5].score],
                [leadBoar[6].username, leadBoar[6].score],
                [leadBoar[7].username, leadBoar[7].score],
                [leadBoar[8].username, leadBoar[8].score],
                [leadBoar[9].username, leadBoar[9].score],
            ];
            
        }
        catch(e)
        {
            console.log(e.toString());
            return;
        }
    }

    leader();

    orderedScores = scores;
}

function coinUpdate()
{
    const game = async event =>
    {
        try {

            var obj = {id : userInfo.id, numCoins: earnings};
            var js = JSON.stringify(obj);

            await fetch(buildPath('api/updateCoins'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            
            obj = {coins : earnings, topscore: user.topscore, assets: user.assets};
            js = JSON.stringify(obj);

            localStorage.removeItem('game_data');
            localStorage.setItem('game_data', js);

            user = JSON.parse(localStorage.getItem('game_data'));
        }
        catch(e)
        {
            console.log(e.toString());
            return;
        }
    }

    game();
}

function assetUpdate(i)
{
    const game = async event =>
    {
        try {

            var obj = {id : userInfo.id, assetNum: i};
            var js = JSON.stringify(obj);

            await fetch(buildPath('api/updateAssets'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            
            var assetList = user.assets;
            assetList[i] = true;
            
            obj = {coins : user.coins, topscore: user.topscore, assets: assetList};
            js = JSON.stringify(obj);
            
            localStorage.removeItem('game_data');
            localStorage.setItem('game_data', js);

            user = JSON.parse(localStorage.getItem('game_data'));
        }
        catch(e)
        {
            console.log(e.toString());
            return;
        }
    }

    game();
}

function topscoreUpdate()
{
    const game = async event =>
    {
        try {

            var obj = {id : userInfo.id, score: highScore};
            var js = JSON.stringify(obj);

            await fetch(buildPath('api/addUserGameSession'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            
            obj = {coins : earnings, topscore: user.topscore, assets: user.assets};
            obj = {coins : user.coins, topscore: highScore, assets: user.assets};
            js = JSON.stringify(obj);

            localStorage.removeItem('game_data');
            localStorage.setItem('game_data', js);

            user = JSON.parse(localStorage.getItem('game_data'));
        }
        catch(e)
        {
            console.log(e.toString());
            return;
        }
    }

    game();
}



function preload () {
    bg1 = loadImage("images/bg2.jpg");
    bgmusic = new Audio('sounds/music.mp3');
    rock = loadImage("images/rock.png");
    rock2 = loadImage("images/rock2.png");
    triangleDown = loadImage("images/triangle_down.png");
    triangleUp = loadImage("images/triangle_up.png");
    triangleLeft = loadImage("images/triangle_left.png");
    triangleRight = loadImage("images/triangle_right.png");
}

var map = [];

var coins = 0;
var trans = 0;

function setup()
{
    textFont("Sancreek");
    canvas = createCanvas(displayWidth, displayHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    angleMode(DEGREES);
    frameRate(60);
}

class structures
{
    constructor(t, r)
    {
        this.t = t;
        this.ele = this.str(r);
        this.x = this.ele[0].x;
    }
    
    str(t)
    {
        // this.r = random();
        
        this.type = 
        [
            [
                new poly([400 + 100, 100 + 100, 400 + 100, 400 + 100], [420, 500, 600, 500], 9), 
                new rectangle(700 + 200, 105, 100, 150), 
                new rectangle(700 + 200, 900 - 155, 100, 150), 
                new poly([1300 + 300, 1000 + 300, 1300 + 300, 1300 + 300], [420, 500, 600, 500], 9),
                new coinCluster(850, 400, 2)
            ],
            [
                new poly([1000 - 600 - 50, 1600 - 50, 1200 - 200 - 50], [100 + 5, 100 + 5, 400 + 5], 3),
                new poly([1000 - 600 - 50, 1200 - 50 - 200, 1000 - 50 - 600], [900 - 5, 900 - 5, 600], 4),
                new poly([1200 - 200 - 50, 1600 - 50, 1600 - 50], [900 - 5, 900 - 5, 600], 5),
                new coinCluster(850, 530, 4)
            ],
            [
                  new circle(700 - 200, 200, 100),
                  new circle(700 - 200, 800, 100),
                  new circle(700 + 300 - 200, 500, 30),
                  new circle(1300 - 200, 200, 100),
                  new circle(1300 - 200, 800, 100),
                  new circle(1600 - 200, 500, 30),
            ],
            [
                  new rectangle(400 - 220, 105, 100, 100),
                  new rectangle(400 - 220, 500, 100, 400 - 5),
                  new rectangle(400 - 220 + 500, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 500, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 1000, 105, 100, 600),
                  new rectangle(400 - 220 + 1500, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 1500, 500 + 250, 100, 400 - 5 - 250),
            ],
            [
                  new poly([100 - 50 + 200 + 500, 100 + 200 + 500, 100 + 50 + 200 + 500], [100 + 5, 200, 100 + 5], 1),
                  new poly([100 - 50 + 310 + 500, 100 + 310 + 500, 100 + 50 + 310 + 500], [100 + 5, 200, 100 + 5], 1),
                  new poly([100 - 50 + 420 + 500, 100 + 420 + 500, 100 + 50 + 420 + 500], [100 + 5, 200, 100 + 5], 1),
                  new poly([100 - 50 + 530 + 500, 100 + 530 + 500, 100 + 50 + 530 + 500], [100 + 5, 200, 100 + 5], 1),
                new coinCluster(900 - 20, 400, 1)
            ],
            [   
                  new poly([100 - 50 + 200 + 500, 100 + 200 + 500, 100 + 50 + 200 + 500], 
                           [900 - 5, 800, 900 - 5], 2),
                  new poly([100 - 50 + 310 + 500, 100 + 310 + 500, 100 + 50 + 310 + 500], 
                           [900 - 5, 800, 900 - 5], 2),
                  new poly([100 - 50 + 420 + 500, 100 + 420 + 500, 100 + 50 + 420 + 500], 
                           [900 - 5, 800, 900 - 5], 2),
                  new poly([100 - 50 + 530 + 500, 100 + 530 + 500, 100 + 50 + 530 + 500], 
                           [900 - 5, 800, 900 - 5], 2),
                new coinCluster(900 - 20, 400, 1)
            ],
            [
                  new rectangle(400 - 220, 105, 100, 100),
                  new rectangle(400 - 220, 500, 100, 400 - 5),
                  new rectangle(400 - 220 + 500, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 500, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 1000, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 1000, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 1500, 105, 100, 100),
                  new rectangle(400 - 220 + 1500, 500, 100, 400 - 5),
            ],
            [
                  new rectangle(400 - 220, 105, 100, 100),
                  new rectangle(400 - 220, 500, 100, 400 - 5),
                  new rectangle(400 - 220 + 500, 105, 100, 100),
                  new rectangle(400 - 220 + 500, 500, 100, 400 - 5),
                  new rectangle(400 - 220 + 1000, 105, 100, 100),
                  new rectangle(400 - 220 + 1000, 500, 100, 400 - 5),
                  new rectangle(400 - 220 + 1500, 105, 100, 100),
                  new rectangle(400 - 220 + 1500, 500, 100, 400 - 5),
            ],
            [
                  new rectangle(400 - 220, 105, 100, 100 + 250),
                  new rectangle(400 - 220, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 500, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 500, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 1000, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 1000, 500 + 250, 100, 400 - 5 - 250),
                  new rectangle(400 - 220 + 1500, 105, 100, 100 + 250),
                  new rectangle(400 - 220 + 1500, 500 + 250, 100, 400 - 5 - 250),
            ],
            [
                new poly([1000 - 600 - 50, 1600 - 50, 1200 - 200 - 50], [900 - 5, 900 - 5, 600 - 5], 6),
                new poly([1000 - 600 - 50, 1200 - 50 - 200, 1000 - 50 - 600], [100 + 5, 100 + 5, 400], 7),
                new poly([1200 - 200 - 50, 1600 - 50, 1600 - 50], [100 + 5, 100 + 5, 400], 8),
                new coinCluster(850 - 380, 330 + 130, 6),
                new coinCluster(850 + 380, 330 + 130, 6),
                new coinCluster(850, 330, 6)
            ],
            [
                  new circle(1000, 200, 130),
                  new circle(1000, 800, 130),
                  new circle(500, 500, 130),
                  new circle(1500, 500, 130),
                  new circle(1500 - 130, 250, 20),
                  new circle(1500 - 130, 750, 20),
                  new circle(500 + 130, 250, 20),
                  new circle(500 + 130, 750, 20),
                  new coinCluster(910, 410, 6)
            ],
            [
                  new poly([1000 - 600 - 50, 1600 - 50, 1550], [900 - 5, 900 - 5, 500 - 5], 10),
                  new poly([1000 - 600 - 50, 1550, 1000 - 600 - 50], [100 + 5, 100 + 5, 500], 11),
            ],
        ];
        
        var r = this.type[t];
        
        for(var i = 0; i < r.length; i++)
        {
            r[i].x += this.t;
        }
        
        return this.type[t];
    }
    
    update()
    {
        if(this.ele[0].x != this.x)
        {
            var dif = this.x - this.ele[0].x;
         
            for(var i = 0; i < this.ele.length; i++)
            {
                this.ele[i].x += dif;
            }
        }
    }
    
    apply(x)
    {
        this.update();
        
        for(var i = 0; i < this.ele.length; i++)
        {
            this.ele[i].apply(x);
        }
    }
    
}

/** Clicked State **/
var clicked = false;
mouseClicked = function(){
    clicked = true;
};
keyPressed = function(){
    keys[keyCode] = true;
};
keyReleased = function(){
    keys[keyCode] = false;
};

var death = false;

var die = function() {
    death = true;
}

var polygonCollide = function(shape1, shape2) {

    var isBetween = function(c, a, b) {
        return (a - c) * (b - c) <= 0;
    };
    
    /* Do ranges a and b overlap? */
    var overlap = function(a, b) {
        return isBetween(b.min, a.min, a.max) || isBetween(a.min, b.min, b.max);
    };
    
    /*
     * Project shape onto axis.  Simply
     * compute dot products between the
     * shape's vertices and the axis, and
     * keep track of the min and max values.
     */
    var project = function(shape, axis) {
        var mn = Infinity;
        var mx = -Infinity;
        for (var i = 0; i < shape.length; i++) {
            var dot = shape[i].x*axis.x + shape[i].y*axis.y;
            mx = max(mx, dot);
            mn = min(mn, dot);
        }
        return { min: mn, max: mx };
    };
    
    /* Compute all projections axes of shape. */
    var getAxes = function(shape) {
        var axes = [];
        for (var i = 0; i < shape.length; i++) {
            var n = (i + 1) % shape.length; 
            /*
             * The edge is simply the delta between i and n.
             * The axis is the edge's normal. And a normal 
             * of (x, y) is either of (y, -x) or (-y, x).
             */
            axes[i] = {
                y: shape[i].x - shape[n].x,
                x: -(shape[i].y - shape[n].y)
            };
        }
        return axes;
    };

    var shapes = [ shape1, shape2 ];
    for (var s = 0; s < shapes.length; s++) {
        var axes = getAxes(shapes[s]);
        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i];
            /* Project both shapes onto this axis */
            var p1  = project(shape1, axis);
            var p2  = project(shape2, axis);
            if (! overlap(p1, p2)) {
                /* The two shapes cannot overlap */
                return false;
            }
        }
    }
    return true;  /* they overlap */
};

class rectangle
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw()
    {
        image(rock2, this.x - 2, this.y - 2, this.w + 4, this.h + 4);
    }

    collision(obj)
    {
        if(this.x + this.w > obj.x && this.x < obj.x + obj.w && this.y + this.h > obj.y && this.y < obj.y + obj.h)
        {
            obj.col = true;
            die();
        }
    }

    apply(x)
    {
        this.collision(x);
        this.draw();
    }
}

class poly
{
    constructor(x, y, s)
    {
        this.xi = [];
        this.yi = [];
        this.x = 0;
        this.s = s;
        for(var i = 0; i < x.length; i++)
        {
            this.xi.push(x[i]);
            this.yi.push(y[i]);
        }
    }

    draw()
    {
        switch(this.s)
        {
            case 1:
                image(triangleDown, this.xi[0] + this.x, 100, 100, 100);
                break;
            case 2:
                image(triangleUp, this.xi[0] + this.x, 800, 100, 100);
                break;
            case 3:
                image(triangleDown, this.xi[0] - 30 + this.x, 100, 1200 + 40, 320);
                break;
            case 4:
                image(triangleLeft, this.xi[0] - 30 + this.x, 600, 650, 305);
                break;
            case 5:
                image(triangleRight, this.xi[0] - 20 + this.x, 600, 650, 305);
                break;
            case 6:
                image(triangleUp, this.xi[0] - 15 + this.x, 580, 1200 + 40, 320);
                break;
            case 7:
                push();
                translate(this.xi[0] + this.x+ 620, 400);
                rotate(180);
                image(triangleRight, 0, 0, 650, 305);
                pop();
                break;
            case 8:
                push();
                translate(this.xi[0] + this.x+ 630, 400);
                rotate(180);
                image(triangleLeft, 0, 0, 650, 305);
                pop();
                break;
            case 9:
                push();
                translate(this.xi[0] + this.x + 110, 420);
                rotate(90 + 2);
                image(triangleDown, -5, 90, 200, 350);
                pop();
                break;
            case 10:
                push();
                translate(this.xi[0] + this.x+ 1150, 500);
                rotate(180);
                image(triangleRight, 0, 0, 1200, 410);
                pop();
                image(triangleRight, this.xi[0] + this.x + 50, 500, 1200, 410);
                break;
        }

//        noFill();
//        stroke(255);
//        strokeWeight(3);
//        beginShape();
//        for(var i = 0 ; i < this.xi.length; i++)
//        {
//            vertex(this.xi[i] + this.x, this.yi[i]);
//        }
//        vertex(this.xi[0] + this.x, this.yi[0]);
//        endShape();

    }
    
    collision(obj)
    {
        var s1 = [{x: obj.x, y: obj.y},{x: obj.x + obj.w, y: obj.y},{x: obj.x + obj.w, y: obj.y + obj.h},{x:obj.x, y:obj.y + obj.h}];
        var s2 = [];

        for(var i = 0; i < this.xi.length; i++)
        {
            s2.push({x: this.xi[i] + this.x, y: this.yi[i]});
        }

        if(polygonCollide(s1, s2) == true)
        {
            obj.col = true;
            die();
        }
    }

    apply(x)
    {
        this.collision(x);
        this.draw();
    }
}

class circle
{
    constructor(x, y, s)
    {
        this.x = x;
        this.y = y;
        this.s = s;
    }

    draw()
    {
        noStroke();
        fill(0, 0, 0, 30);
        ellipse(this.x, this.y, this.s * 1.2, this.s * 1.2);
        ellipse(this.x, this.y, this.s * 1.1, this.s * 1.1);
        ellipse(this.x, this.y, this.s * 1.3, this.s * 1.3);
        image(rock, this.x - this.s / 2, this.y - this.s / 2, this.s, this.s);
    }
    
    collision(obj)
    {
        var testX = this.x;
        var testY = this.y;
        
        if(this.x<obj.x){
            testX = obj.x;
        }
        if(this.x>obj.x+obj.w){
            testX = obj.x+obj.w;
        }
        if(this.y<obj.y){
            testY = obj.y;
        }
        if(this.y>obj.y+obj.h){
            testY = obj.y+obj.h;
        }
        
        var distX = this.x-testX;
        var distY = this.y-testY;
        var distance = sqrt(sq(distX)+sq(distY));
        
        if(distance<=this.s/2)
        {
            obj.col = true;
            die();
        }
    }

    apply(x)
    {
        this.collision(x);
        this.draw();
    }
}

var ghost = function (x, y, s) {
    
    push();
    translate(x, y);
    scale(s / 100);
    
    strokeWeight(4);
    stroke(255, 255, 255, 100);
    fill(255);
    arc(200, 200, 48, 47, -169, -12);
    rect(175, 190, 50, 71, 10);
    ellipse(183, 257 + 2, 15, 20 + sin(frameCount * 4) * 5);
    ellipse(195, 257 + 2, 15, 20 + sin(frameCount * 5) * 5);
    ellipse(206, 257 + 2, 15, 20 + sin(frameCount * 3) * 5);
    ellipse(218, 257 + 2, 15, 20 + sin(frameCount * 2) * 5);
    
    noStroke();
    fill(0, 0, 0, 40);
    rect(177, 197, 3, 55, 10);
    arc(198, 200, 43, 40, -171, 0);
    fill(255);
    arc(200, 200, 40, 40, -180, 0);
    
    stroke(255, 255, 255, 100);
    fill(0);
    ellipse(215, 200, 12, 16);
    ellipse(200, 200, 13, 20);
    ellipse(208, 219, 21, 9);
    fill(255);
    arc(206, 219, 20, 11, -119, -92);
    arc(211, 219, 20, 11, -93, -66);
    arc(211, 219, 20, 11, -93 + 180, -66 + 180);
    arc(204, 219, 20, 11, -119 + 180, -92 + 180);
    pop();
};

var zombie = function (x, y, s) {
    
    push();
    translate(x, y);
    scale(s / 100);
    
    stroke(79, 51, 2, 100);
    fill(128, 84, 9);
    rect(214, 225, 24, 49, 4);
    fill(179, 127, 43);
    ellipse(219, 285 - sin(frameCount * 6) * 3, 15, 10);
    ellipse(235, 285 + sin(frameCount * 6) * 3, 15, 10);
    
    stroke(13, 255, 0, 100);
    fill(73, 184, 63);
    rect(200, 200, 50, 50, 10);
    ellipse(227, 261 + sin(frameCount * 4) * 2, 10, 10);
    ellipse(249, 261 - sin(frameCount * 4) * 2, 10, 10);
    
    fill(255);
    stroke(30, 102, 1, 50);
    ellipse(239, 223, 12, 12);
    ellipse(221, 223, 15, 15);
    fill(100, 0, 120, 200);
    ellipse(229, 239, 10, 10);
    
    fill(0);
    ellipse(219, 220, 5, 5);
    ellipse(241, 220, 3, 3);
    
    stroke(150, 14, 150, 50);
    fill(222, 111, 222);
    ellipse(206, 205, 20, 20);
    ellipse(203, 216, 15, 15);
    ellipse(217, 202, 10, 10);
    
    noStroke();
    fill(0, 0, 0, 20);
    rect(200, 222, 6, 27, 10);
    rect(215, 251, 3, 22, 10);
    fill(0, 0, 0, 30);
    ellipse(215, 237, 3, 3);
    ellipse(210, 234, 3, 3);
    ellipse(210, 240, 3, 3);
    
    fill(186, 186, 186);
    rect(199, 254, 13, 17, 10);
    rect(199, 263, 13, 11);
    fill(255, 87, 87);
    rect(199, 261, 13, 2);
    rect(199, 267, 13, 2);
    fill(255, 255, 255, 50);
    rect(199, 263, 6, 11);
    
    pop();
};

var witch = function (x, y, s) {
    push();
    translate(x, y);
    scale(s / 100);
    fill(161, 68, 161);
    stroke(110, 38, 110, 100);
    rect(214, 225, 24, 49, 4);
    fill(180, 104, 212);
    ellipse(219, 285 - sin(frameCount * 6) * 3, 15, 10);
    ellipse(235, 285 + sin(frameCount * 6) * 3, 15, 10);
    
    stroke(130, 79, 8, 100);
    fill(214, 177, 90);
    rect(200, 200, 50, 50, 50);
    ellipse(227, 261 + sin(frameCount * 4) * 2, 10, 10);
    ellipse(249, 261 - sin(frameCount * 4) * 2, 10, 10);
    
    fill(255);
    stroke(138, 98, 5, 50);
    ellipse(239, 223, 12, 12);
    ellipse(221, 223, 15, 15);
    stroke(140, 102, 14);
    strokeWeight(2);
    line(225, 237, 221, 242);
    line(225, 237, 230, 242);
    line(235, 237, 230, 242);
    line(235, 237, 239, 242);
    stroke(0, 0, 0, 100);
    strokeWeight(3);
    
    fill(0);
    ellipse(224, 223, 5, 5);
    ellipse(242, 223, 5, 5);
    
    
    noStroke();
    fill(0, 0, 0, 30);
    rect(215, 251, 3, 22, 10);
    rect(201, 211, 3, 28, 10);
    fill(0, 0, 0, 30);
    ellipse(215, 237, 3, 3);
    ellipse(210, 234, 3, 3);
    ellipse(210, 240, 3, 3);
    
    fill(23, 135, 19);
    rect(199, 254, 13, 17, 10);
    rect(199, 263, 13, 11);
    fill(212, 143, 63);
    rect(199, 261, 13, 2);
    rect(199, 267, 13, 2);
    fill(255, 255, 255, 50);
    rect(199, 263, 6, 11);
    
    stroke(99, 81, 0, 100);
    fill(79, 47, 0);
    beginShape();
    vertex(198, 210);
    vertex(194, 236);
    vertex(211, 207);
    endShape();
    
    beginShape();
    vertex(243, 207);
    vertex(253, 236);
    vertex(250, 207);
    endShape();
    
    fill(161, 68, 161);
    stroke(110, 38, 110, 100);
    beginShape();
    vertex(185, 214);
    vertex(263, 209);
    vertex(239, 201);
    vertex(232, 183);
    vertex(208, 173);
    vertex(219, 185);
    vertex(211, 200);
    vertex(185, 214);
    endShape();
    
    fill(0, 0, 0, 50);
    stroke(110, 38, 110, 50);
    beginShape();
    vertex(185, 214);
    vertex(205, 212);
    vertex(215, 201);
    vertex(224, 183);
    vertex(208, 173);
    vertex(219, 185);
    vertex(211, 200);
    endShape();
    pop();
};

var vamp = function (x, y, s) {
    
    push();
    translate(x, y);
    scale(s / 100);
    
    fill(0, 0, 0);
    stroke(255, 255, 255, 100);
    strokeWeight(3);
    push();
    translate(223, 248);
    scale(0.5);
    rotate(-7 - sin(frameCount * 15) * 20);
    translate(-237, -240);
    beginShape();
    vertex(219, 256);
    vertex(180, 241);
    vertex(173, 265);
    vertex(185, 250);
    vertex(190, 265);
    vertex(197, 255);
    vertex(204, 265);
    vertex(204, 255);
    vertex(220, 261);
    endShape();
    pop();
    
    push();
    translate(223, 248);
    scale(0.5);
    rotate(-7 + sin(frameCount * 15) * 20);
    translate(-237, -240);
    beginShape();
    vertex(219, 256);
    vertex(180, 241);
    vertex(173, 265);
    vertex(185, 250);
    vertex(190, 265);
    vertex(197, 255);
    vertex(204, 265);
    vertex(204, 255);
    vertex(220, 261);
    endShape();
    pop();
    
    strokeWeight(3);
    fill(0, 0, 0);
    stroke(255, 255, 255, 60);
    rect(214, 225, 24, 49, 4);
    
    fill(255, 255, 255);
    rect(229, 225, 8, 49, 4);
    
    fill(0, 0, 0);
    ellipse(234, 259, 3, 3);
    ellipse(234, 265, 3, 3);
    ellipse(234, 271, 3, 3);
    
    ellipse(219, 285 - sin(frameCount * 6) * 3, 15, 10);
    ellipse(235, 285 + sin(frameCount * 6) * 3, 15, 10);
    
    
    strokeWeight(2);
    stroke(255, 0, 0, 100);
    fill(161, 9, 9, 250);
    beginShape();
    vertex(190, 238);
    vertex(231, 255);
    vertex(238, 255);
    vertex(238, 246);
    endShape();
    strokeWeight(2);
    
    stroke(0, 0, 0, 100);
    fill(214, 214, 214);
    rect(200, 200, 50, 50, 100);
    ellipse(227, 261 + sin(frameCount * 4) * 2, 10, 10);
    ellipse(249, 261 - sin(frameCount * 4) * 2, 10, 10);
    
    fill(255);
    stroke(0, 0, 0, 50);
    ellipse(239, 223, 12, 12);
    ellipse(221, 223, 15, 15);
    stroke(138, 14, 14, 250);
    noFill();
    strokeWeight(2);
    line(219, 236, 222, 242);
    line(227, 239, 223, 242);
    line(227, 239, 230, 242);
    line(235, 239, 230, 242);
    line(235, 239, 239, 242);
    line(242, 235, 239, 242);
    
    fill(255, 255, 255);
    arc(226, 235, 21, 14, 90 - 20, 90 + 20);
    arc(234, 235, 21, 14, 90 - 25, 90 + 15);
    
    stroke(0, 0, 0, 100);
    strokeWeight(3);
    
    fill(0);
    ellipse(224, 223, 5, 5);
    ellipse(242, 223, 5, 5);
    
    noStroke();
    fill(0, 0, 0, 30);
    rect(215, 251, 3, 22, 10);
    rect(201, 211, 5, 28, 10);
    fill(0, 0, 0, 30);
    ellipse(215, 237, 3, 3);
    ellipse(210, 234, 3, 3);
    ellipse(210, 240, 3, 3);
    
    
    
    fill(255, 255, 255, 50);
    arc(229, 209, 50 + 3, 21 + 3, -159 - 5, -52 + 5);
    fill(30, 30, 30);
    arc(229, 209, 50, 21, -159, -52);
    fill(255, 255, 255, 30);
    arc(229, 207, 41, 15, -159, -52);
    
    pop();
};

var clown = function (x, y, s) {
    push();
    translate(x, y);
    scale(s / 100);
    strokeWeight(3);
    
    
    fill(182, 87, 199);
    stroke(255, 255, 255, 100);
    rect(214, 225, 24, 49, 4);
    
    fill(255, 255, 255);
    rect(231, 225, 6, 41, 4);
    
    fill(255, 0, 0);
    ellipse(235, 254, 3, 3);
    ellipse(235, 261, 3, 3);
    fill(182, 87, 199);
    ellipse(219, 285 - sin(frameCount * 6) * 3, 15, 10);
    ellipse(235, 285 + sin(frameCount * 6) * 3, 15, 10);
    
    strokeWeight(2);
    
    stroke(0, 0, 0, 100);
    fill(255, 255, 255);
    rect(200, 200, 50, 50, 100);
    ellipse(227, 261 + sin(frameCount * 4) * 2, 10, 10);
    ellipse(249, 261 - sin(frameCount * 4) * 2, 10, 10);
    
    fill(255);
    stroke(0, 0, 0, 50);
    ellipse(239, 223, 12, 12);
    ellipse(221, 223, 15, 15);
    
    stroke(0, 0, 0, 100);
    strokeWeight(3);
    
    fill(0);
    ellipse(224, 223, 5, 5);
    ellipse(242, 223, 5, 5);
    
    noStroke();
    fill(0, 0, 0, 30);
    rect(215, 251, 3, 22, 10);
    rect(201, 211, 5, 28, 10);
    fill(255, 0, 0, 100);
    ellipse(215, 237, 3, 3);
    fill(0, 26, 255, 100);
    ellipse(210, 234, 3, 3);
    fill(255, 77, 0, 100);
    ellipse(210, 240, 3, 3);
    
    stroke(0, 0, 0, 40);
    fill(255, 0, 0);
    ellipse(231, 235, 10, 10);
    noStroke();
    fill(255, 255, 255, 70);
    ellipse(232, 234, 6, 4);
    noFill();
    strokeWeight(1);
    stroke(255, 0, 0);
    arc(231, 241, 15, 7, 0, 180);
    
    stroke(13, 133, 0, 200);
    strokeWeight(2);
    line(211, 215, 226, 211);
    line(245, 213, 236, 211);
    
    noStroke();
    fill(13, 133, 0, 200);
    ellipse(200, 215, 14, 14);
    ellipse(208, 206, 14, 14);
    ellipse(201, 206, 14, 14);
    ellipse(250, 215, 12, 12);
    ellipse(249, 207, 12, 12);
    ellipse(242, 204, 12, 12);
    ellipse(220, 201, 12, 12);
    ellipse(231, 203, 12, 12);
    ellipse(227, 200, 12, 12);
    ellipse(236, 201, 12, 12);
    ellipse(211, 202, 12, 12);
    rect(209, 199, 35, 8, 3);
    
    fill(230, 0, 0);
    rect(199, 254, 13, 17, 10);
    rect(199, 263, 13, 11);
    fill(255, 255, 255, 150);
    rect(199, 261, 13, 2);
    rect(199, 267, 13, 2);
    fill(255, 255, 255, 50);
    rect(199, 263, 6, 11);
    
    pop();
};

class player
{
  constructor(x, y, w, h)
  {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vY = 0; this.grav = 0.8; this.power = 3; this.col = false;
    this.sw = "move";
    this.particles = { x: [], y: [], s: [], r: [], upAmount: [] };
  }

  draw()
  {
        if(this.particles.x.length <= 30)
        {
            this.particles.x.push(this.x + this.w / 2);
            this.particles.y.push(this.y + this.h / 2);
            this.particles.s.push(random(0, 20));
            this.particles.r.push(random(0, 900));
        }

        for(var i = 0; i < this.particles.x.length; ++i)
        {
            switch(curType)
            {
                case "ghost":
                    fill(255, 255, 255, 100);
                    
                    if(this.particles.s[i] <= 0)
                    {
                        this.particles.x[i] = this.x + this.w / 2;
                        this.particles.y[i] = this.y + this.h / 2;
                        this.particles.s[i] = random(0, 20);
                        this.particles.r[i] = random(0, 90);
                        this.particles.upAmount[i] = 0;
                    }
                    break;
                    
                case "vamp":
                    fill(255, 0, 0, 100);
                    
                    if(this.particles.s[i] <= 0)
                    {
                        this.particles.x[i] = this.x + this.w / 2;
                        this.particles.y[i] = this.y + this.h / 2;
                        this.particles.s[i] = random(0, 20);
                        this.particles.r[i] = random(0, 90);
                        this.particles.upAmount[i] = 0;
                    }
                    break;

                case "zombie":
                    fill(13, 255, 0, 100);
                    
                    if(this.particles.s[i] <= 0)
                    {
                        this.particles.x[i] = this.x + this.w / 2 - 23;
                        this.particles.y[i] = this.y + this.h / 2 + 30;
                        this.particles.s[i] = random(0, 20);
                        this.particles.r[i] = random(0, 90);
                        this.particles.upAmount[i] = 0;
                    }
                    break;
                    
                case "clown":
                    fill(182, 87, 199, 100);
                    
                    if(this.particles.s[i] <= 0)
                    {
                        this.particles.x[i] = this.x + this.w / 2 - 23;
                        this.particles.y[i] = this.y + this.h / 2 + 30;
                        this.particles.s[i] = random(0, 20);
                        this.particles.r[i] = random(0, 90);
                        this.particles.upAmount[i] = 0;
                    }
                    break;
                    
                case "witch":
                    fill(232, 153, 75, 100);
                    
                    if(this.particles.s[i] <= 0)
                    {
                        this.particles.x[i] = this.x + this.w / 2 - 23;
                        this.particles.y[i] = this.y + this.h / 2 + 30;
                        this.particles.s[i] = random(0, 20);
                        this.particles.r[i] = random(0, 90);
                        this.particles.upAmount[i] = 0;
                    }
                    break;
            }
            
            push();
            translate(this.particles.x[i], this.particles.y[i]);
            rotate(this.particles.r[i]);
            ellipse(0, this.particles.upAmount[i], this.particles.s[i], this.particles.s[i]);
            pop();

            if(this.sw === "")
                this.particles.s[i] -= 1;

            this.particles.upAmount[i] += this.particles.s[i] / 2;

            if(this.sw !== "")
                this.particles.x[i] -= (gameSpeed / 2);
        }
      
        switch(curType)
        {
            case "ghost":
                ghost(this.x - 190, this.y - 200, 110);
                break;
                
            case "zombie":
                zombie(this.x - 240, this.y - 250, 120);
                break;
                
            case "witch":
                witch(this.x - 240, this.y - 250, 120);
                break;
                
            case "vamp":
                vamp(this.x - 240, this.y - 250, 120);
                break;
                
            case "clown":
                clown(this.x - 240, this.y - 250, 120);
                break;
        }
  }

  movement()
  {
    if(!death)
    {
        this.y += this.vY;
        this.vY += this.grav;

        if(this.y + this.h > bottom - 1)
            this.sw = "move";
        else
            this.sw = "";

        if(this.y + this.h >= bottom)
        {
            this.y = bottom - this.h - 0.01;
            this.vY = 0;
        }

        if(this.y <= ceiling)
        {
            this.y = ceiling + 0.01;
            this.vY = 0;
        }

        if(keys[38] || keys[87])
            this.vY -= this.power;

          if(this.vY <= -10)
              {
                  this.vY = -10;
              }
    }
  }

  colision(blocks)
  {
    
  } 

  apply()
  {
      this.colision();
      this.movement();
      this.draw();
  }

}

class coinCluster
{
    constructor(x, y, type)
    {
        this.x1 = x;
        this.y1 = y;
        this.x = x;
        this.type = type;
        this.l = this.shape(this.type);
        this.format();
    }

    shape(type)                                                                                      
    {
        switch(type)
        {
            case 1:
                
                return [
                    [1, 1, 1, 1, 1, 1, 1], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1]
                ];

                break;

            case 2:

                return [
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 1, 1, 0, 1, 1, 0], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [1, 1, 1, 1, 1, 1, 1],
                    [0, 1, 1, 1, 1, 1, 0],
                    [0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0]
                ];

                break;
            
            case 3:

                return [
                    [0, 0, 1, 0, 1, 0, 0], 
                    [0, 0, 1, 0, 1, 0, 0], 
                    [0, 0, 1, 0, 1, 0, 0], 
                    [0, 0, 1, 0, 1, 0, 0],
                    [1, 0, 0, 0, 0, 0, 1],
                    [0, 1, 1, 1, 1, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0]

                ];

                break;

            case 4:


                return[
                    [1, 1, 1, 1, 1, 1, 1], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [1, 1, 1, 1, 1, 1, 1], 
                ]

            case 5:
                
                return [
                    [1, 1, 1, 1, 1, 1, 1], 
                    [1, 1, 1, 1, 1, 1, 1], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1]
                ];

                break;

                case 6:

                    return[
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1], 
                        [1, 1, 0, 0, 0, 1, 1]
                    ]
                
                    break;
        }
    }

    format()
    {
        this.coins = [];
        
        for(var i = 0; i < this.l.length; i++)
        {
            this.coins.push([]);
            for(var j = 0; j < this.l[i].length; j++)
            {
                if(this.l[i][j] == 1)
                    this.coins[i].push(new coin(this.x1 + 30 * j, this.y1 + 30 * i, 25));
            }
        }
    }
    
    update()
    {
        if(this.x1 != this.x)
        {
            var dif = this.x - this.x1;
            this.x1 = this.x;
            
            for(var i = 0; i < this.coins.length; i++)
            {
                for(var j = 0; j < this.coins[i].length; j++)
                {
                    this.coins[i][j].x += dif;
                }
            }
            
        }
    }
    
    draw(obj)
    {
        this.update();

        for(var i = 0; i < this.coins.length; i++)
        {
            for(var j = 0; j < this.coins[i].length; j++)
            {
                this.coins[i][j].apply(obj);
            }
        }

    }

    apply(x)
    {
        this.draw(x);
        //this.coins[0][0].apply(obj);
        
    }

}

class coin
{
    constructor(x, y, s)
    {
        this.x = x;
        this.y = y;
        this.s = s;
        this.col = false;
        this.anim = 200;
    }

    draw()
    {
        noStroke();
        
        if(!this.col)
        {
            
            stroke(255, 255, 255, 150);
            strokeWeight(5);
            fill(255, 255, 255);
            ellipse(this.x, this.y, 2 + (this.s - 4) *sin(frameCount * 3) - 2, this.s - 2);
        } else
        {
            fill(255, 255, 255, this.anim);
            ellipse(this.x, this.y, this.s + 30 - this.anim / 10, this.s + 30 - this.anim / 10);
            this.anim /= 1.3;
        }
    }

    collision(obj)
    {
        var testX = this.x;
        var testY = this.y;
        
        if(this.x<obj.x){
            testX = obj.x;
        }
        if(this.x>obj.x+obj.w){
            testX = obj.x+obj.w;
        }
        if(this.y<obj.y){
            testY = obj.y;
        }
        if(this.y>obj.y+obj.h){
            testY = obj.y+obj.h;
        }
        
        var distX = this.x-testX;
        var distY = this.y-testY;
        var distance = sqrt(sq(distX)+sq(distY));
        
        if(distance<=this.s/2 && !this.col)
        {
            coins ++;
            this.col = true;
        }
    }

    apply(x)
    {
        this.collision(x);
        this.draw();
    }
}


var paralax1 = 0, paralax2 = 1920, paralax3 = 1920 * 2;
var p = new player(100, 700, 60, 100);
var z = [];

/** Buttons **/
class Button {
    constructor (x, y, w, h, m, sceneChange, d) {
        this.x = 0;
        this.y = 0;
        this.m1 = x;
        this.m2 = y;
        this.w = w;
        this.h = h;
        this.m = m;
        this.d = d;
        this.sceneChange = sceneChange;
        this.anim = 10;
    }
    
    draw () {
        
        this.x = window.innerWidth / 2 - this.w / 2 + this.m1;
        this.y = window.innerHeight / this.d + 200 + this.m2;
        
        if(mouseX >= this.x && mouseX <= this.x + this.w &&
        mouseY >= this.y && mouseY <= this.y + this.h)
        {
            cursor(HAND);
            
            this.anim /= 1.2;
    
            if(clicked)
            {
                if(this.m === "<")
                {
                    storeSwipe --;
                }
                
                if(this.m === ">")
                {
                    storeSwipe ++;
                }
                
                if(this.sceneChange === "game")
                {
                    start = true;
                    gameSpeed = 7;
                    paralax1 = 0;
                    paralax2 = 1920;
                    paralax3 = 1920 * 2;
                    score = 0;
                    z = [];
                    p.y = 700;
                    p.vY = 0;
                    coins = 0;
                    trans = 0;
                }
                
                if(this.sceneChange === "leaderboard")
                {
                    leaderboard()
                }

                scene = this.sceneChange;
            }
        }
        else {
            this.anim += 1;
        }
        
        if(this.anim >= 10)
        {
            this.anim = 10;
        }
        
        if(this.anim <= 0)
        {
            this.anim = 0;
        }
        
        
        noStroke();
        fill(200);
        rect(this.x, this.y + 20, this.w, this.h - 20, 5);
        
        fill(255, 255, 255);
        rect(this.x, this.y + 10 - this.anim, this.w, this.h - 10, 5);
        
        strokeWeight(3);
        stroke(0, 0, 0, 100);
        textSize(35);
        fill(0);
        text(this.m, this.x + this.w / 2, this.y + this.h / 2 + 10 - this.anim);
    }
}

var playbutton = new Button(0, 0, 300, 75, "PLAY", "game", 4);
var storebutton = new Button(0, 90, 300, 75, "STORE", "store", 4);
var baordbutton = new Button(0, 180, 300, 75, "< 1 2 3 >", "leaderboard", 4);
var accountbutton = new Button(0, 270, 300, 75, "Account", "account", 4);
var back = new Button(0, 180 - 240, 170, 70, "HOME", "menu", 2);
var back2 = new Button(0, 280 - 240, 170, 70, "HOME", "menu", 2);
var left = new Button(-150, -220, 50, 50, "<", "store", 2);
var right = new Button(150, -220, 50, 50, ">", "store", 2);

var testClust = new structures(0, 11);

var storeX = 300;
var storeY = 300;

function draw()
{
    background(0);
    textAlign(CENTER, CENTER);
    cursor(ARROW);
    
    //fill(0, 0, 0, 100);
    //rect(0, 0, window.innerWidth, window.innerHeight);

    switch(scene)
    {
        case"account":
            window.location.href = '/account';
            image(bg1, paralax1, 0, 1940, window.innerHeight);
            image(bg1, paralax2, 0, 1940, window.innerHeight);
            image(bg1, paralax3, 0, 1940, window.innerHeight);
            gameSpeed = 0;

            textSize(100);
            fill(255, 255, 255);
            text("LOADING...", window.innerWidth / 2, window.innerHeight/2.5);
            break;
        case "leaderboard":
        
        image(bg1, paralax1, 0, 1940, window.innerHeight);
        image(bg1, paralax2, 0, 1940, window.innerHeight);
        image(bg1, paralax3, 0, 1940, window.innerHeight);
    
        gameSpeed = 5;
        
        back2.draw();
            
            
        textSize(30);
        
        fill(255);
        
        for (var a = 0; a < 10; a++) 
        {
            text("("+(a + 1) + "). " + orderedScores[a][0] + " - " + orderedScores[a][1], window.innerWidth / 2, -200 + window.innerHeight / 2 + a * 40);
            
        }
            
            break;
            
        case "store":

        image(bg1, paralax1, 0, 1940, window.innerHeight);
        image(bg1, paralax2, 0, 1940, window.innerHeight);
        image(bg1, paralax3, 0, 1940, window.innerHeight);

    
        gameSpeed = 5;
        
        storeX = window.innerWidth / 2;
        storeY = window.innerHeight / 2;
            
        for(var i = 0; i < store.type.length; i++)
        {
            if(storeSwipe < i + 2 && storeSwipe > i - 2)
            {
                push();
                translate(storeX + i * 300 - storeSwipe * 300, storeY);
                scale(0.7);
                stroke(255, 255, 255, 50);
                
                if(storeSwipe !== i)
                {
                    if(i > storeSwipe)
                    {
                        translate(-85, 0);
                    }
                    if(i < storeSwipe)
                    {
                        translate(85, 0);
                    }
                    scale(0.5, 0.5);
                }
                
                noFill();
                strokeWeight(15);
                stroke(255, 255, 255, 100);
                ellipse(0, 0, 320, 320);
                strokeWeight(5);
                stroke(255, 255, 255);
                ellipse(0, 0, 320, 320);
                
                textSize(32);
                
                fill(255);
                strokeWeight(5);
                stroke(255, 255, 255, 50);
                
                if(!store.bought[i])
                {
                    text("BUY FOR " + store.prices[i], 0, 85);
                }
                else
                {
                    if(curType !== store.type[i])
                    {
                        text("PURCHASED", 0, 85);
                    } else
                    {
                        text("SELECTED", 0, 85);
                    }
                }
                
                switch (store.type[i])
                {
                    case "ghost":
                        ghost(-200, -230, 100);
                        break;
                    case "clown":
                        clown(-222, -250, 100);
                        break;
                    case "zombie":
                        zombie(-222, -250, 100);
                        break;
                    case "witch":
                        witch(-222, -250, 100);
                        break;
                    case "vamp":
                        vamp(-222, -250, 100);
                        break;
                }
                
                textSize(28);
                fill(255, 255, 255);
                text(store.name[i], 0, -98);
                
                pop();
            }
        }
        
        fill(255, 255, 255);
        text("$" + earnings, window.innerWidth / 2, window.innerHeight / 2 - 150);
        
        if(dist(mouseX, mouseY, storeX, storeY) < 110)
        {
            if(store.prices[storeSwipe] > earnings && !store.bought[storeSwipe])
            {
                cursor("not-allowed");
            }
            
            if(store.prices[storeSwipe] <= earnings && !store.bought[storeSwipe])
            {
                cursor(HAND);
                
                if(clicked)
                {
                    earnings -= store.prices[storeSwipe];
                    store.bought[storeSwipe] = true;
                    coinUpdate();
                    assetUpdate(storeSwipe);
                }
            }
            if(store.bought[storeSwipe])
            {
                if(curType !== store.type[storeSwipe])
                {
                    cursor(HAND);
                }
                
                if(clicked)
                {
                    curType = store.type[storeSwipe];
                }
            }
        }
        
        if(storeSwipe > 0)
        {
            left.draw();
        }
        if(storeSwipe < store.type.length - 1)
        {
            right.draw();
        }
            
        back.draw();

            break;
            
        case "menu":
            
        image(bg1, paralax1, 0, 1940, window.innerHeight);
        image(bg1, paralax2, 0, 1940, window.innerHeight);
        image(bg1, paralax3, 0, 1940, window.innerHeight);
        
        trans /= 1.1;
        
        gameSpeed = 5;
        
        playbutton.draw();
        storebutton.draw();
        baordbutton.draw();
        accountbutton.draw();
        
        strokeWeight(3);
        stroke(255,255,255, 100);
        fill(255);
        
        if(!start)
        {
            textSize(30 + window.innerWidth / 30);
            text("Dungeon Run", window.innerWidth / 2, window.innerHeight / 5);
        } else
        {
            if(score > 0)
            {
                textSize(20 + window.innerWidth / 60);
                text("SCORE: " + score + "m\n" + "HIGHSCORE: " + highScore + "m\n" + "COINS: $" + earnings, window.innerWidth / 2, window.innerHeight / 5);
            }
            else
            {
                textSize(20 + window.innerWidth / 60);
                text("\n" + "HIGHSCORE: " + highScore + "m\n" + "COINS: $" + earnings, window.innerWidth / 2, window.innerHeight / 5);
            }
        }
        
        if(highScore < score)
        {
            highScore = score;
            topscoreUpdate();
        }
        
        textSize(20 + window.innerWidth / 70);
        text("- " + name + " -", window.innerWidth / 2, 160 + window.innerHeight / 5);
        
            break;
        
        case "game":
        
        push();
        scale(window.innerHeight / 960);
            
        image(bg1, paralax1, 100, 1940, 800);
        image(bg1, paralax2, 100, 1940, 800);
        image(bg1, paralax3, 100, 1940, 800);
            
        if(death)
        {
            gameSpeed = 0;
        }

        p.apply();

        if(z.length < 3)
        {
            z.push(new structures(1920 * (z.length + 1), floor(random(0, mapLength))))
        }

        for(var i = 0; i < z.length; i++)
        {
            if(z[i].t <= 1920)
            {
                z[i].apply(p);
            }
            z[i].t -= gameSpeed;
            z[i].x -= gameSpeed;

            if(z[i].t <= -1920)
            {
                z[i] = new structures(1920 * 2,  floor(random(0, mapLength)));
            }
        }

        // testClust.apply(p);

        gameSpeed += 0.0005;

        if(gameSpeed >= 18)
            gameSpeed = 18;

        strokeWeight(15);
        stroke(255, 255, 255, 50);
        line(0, bottom + 2, displayWidth * 1.5, bottom + 2);
        line(0, ceiling - 2, displayWidth * 1.5, ceiling - 2);

        strokeWeight(5);
        stroke(255);
        line(0, bottom + 2, displayWidth * 1.5, bottom + 2);
        line(0, ceiling - 2, displayWidth * 1.5, ceiling - 2);

        score += floor(gameSpeed / 5);

        push();
        textSize(50);
        strokeWeight(1);
        fill(255);
        stroke(255, 255, 255, 50);
        textAlign(LEFT, 0);
        text(score + " m", 10, 65);
        textAlign(RIGHT, 0);
        text("$" + coins, window.innerWidth - 10, 65);
        strokeWeight(8);
        textAlign(LEFT, 0);
        text(score + " m", 10, 65);
        textAlign(RIGHT, 0);
        text("$" + coins, window.innerWidth - 10, 65);
        pop();
            
        pop();
        break;
    }
    
    paralax1 -= gameSpeed;
    paralax2 -= gameSpeed;
    paralax3 -= gameSpeed;

    if(paralax1 <= -1920)
    {
       paralax1 = 1920 * 2;
    }
    if(paralax2 <= -1920)
    {
        paralax2 = 1920 * 2;
    }
    if(paralax3 <= -1920)
    {
        paralax3 = 1920 * 2;
    }
    
    if(death)
    {
        trans += 5;
    }
    
    if(trans >= 300 && scene === "game")
    {
        death = false;
        scene = "menu";
        earnings += coins;
        coinUpdate();
    }
    
    noStroke();
    fill(255, 255, 255, trans);
    rect(0, 0, window.innerWidth, window.innerHeight);
    
    clicked = false;
}
