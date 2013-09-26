var ws = require('websocket.io')
, server = ws.listen(3000);

var TOURNAMENT_EXPECTED_PLAYERS_COUNT = 2;

// =================================================== HELPERS ===================================================

function shuffle(array) {
    var i = array.length;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

// If only one argument is provided, than it will generate random number from 0 to left
// In other case it will generate number between left and right
function random(left, right) {
    if ( ! right ) {
        return Math.floor((Math.random()*left));
    } else {
        return Math.floor(left) + Math.floor((Math.random()*(right - left)));
    }
}

function isOnMap(x, y, width, height) {
    if ( x >= 0 && x < width && y >= 0 && y < height ) {
        return true;
    }
    return false;
}

function hasSameCoordinates(object1, object2) {
    return object1["X"] == object2["X"] && object1["Y"] == object2["Y"];
}

// =================================================== Weapon ===============================================

function Weapon(type, x, y, direction, mapWidth, mapHeight, socketName) {
    if ( type == "bullet" ) {
        return new Bullet(x, y, direction, mapWidth, mapHeight, socketName);
    } else if ( type == "bouncyBullet" ) {
        return new BouncyBullet(x, y, direction, mapWidth, mapHeight, socketName);
    }
    return null;
}

// =================================================== Bullet ===================================================

function Bullet(x, y, direction, mapWidth, mapHeight, socketName) {
    this.X = x;
    this.Y = y;
    this.direction = direction;
    this.socketName = socketName;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
}

Bullet.prototype.move = function() {
    switch ( this.direction ) {
        case "up-left":
        case "left-up":
            this.X--;
            this.Y--;
            break;
            
        case "up":
            this.Y--;
            break;
            
        case "up-right":
        case "right-up":
            this.Y--;
            this.X++;
            break;
            
        case "left":
            this.X--;
            break;
            
        case "right":
            this.X++;
            break;
            
        case "left-down":
        case "down-left":
            this.X--;
            this.Y++;
            break;
            
        case "down":
            this.Y++;
            break;
            
        case "right-down":
        case "down-right":
            this.X++;
            this.Y++;
            break;
    }
    
    if ( ! isOnMap(this.X, this.Y, this.mapWidth, this.mapHeight) ) {
        return -1;
    }
}

Bullet.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "direction": this.direction, "type": "bullet"};
}

// =================================================== BouncyBullet ===================================================

function BouncyBullet(x, y, direction, mapWidth, mapHeight, socketName) {
    this.X = x;
    this.Y = y;
    this.direction = direction;
    this.socketName = socketName;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
}

BouncyBullet.prototype.move = function() {
    
    var currentDirection = this.direction;
    
    switch ( this.direction ) {
        case "up-left":
        case "left-up":
            if ( this.X == 0 && this.Y == 0 ) {
                this.direction = "down-right";
            } else if ( this.X == 0 && this.Y > 0 ) {
                this.direction = "right-up";
            } else if ( this.Y == 0 && this.X > 0 ) {
                this.direction = "left-down";
            } else {
                this.X--;
                this.Y--;
            }
            break;
            
        case "up":
            if ( this.Y == 0 ) {
                this.direction = "down";
            } else {
                this.Y--;
            }
            break;
            
        case "up-right":
        case "right-up":
            if ( this.X == this.mapWidth - 1 && this.Y == 0 ) {
                this.direction = "left-down";
            } else if ( this.X == this.mapWidth - 1 && this.Y > 0 ) {
                this.direction = "left-up";
            } else if ( this.Y == 0 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-down";
            } else {
                this.Y--;
                this.X++;
            }
            break;
        
        case "left":
            if ( this.X == 0 ) {
                this.direction = "right";
            } else {
                this.X--;
            }
            break;
            
        case "right":
            if ( this.X == this.mapWidth - 1 ) {
                this.direction = "left";
            } else {
                this.X++;
            }
            break;
            
        case "left-down":
        case "down-left":
            if ( this.X == 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "up-right";
            } else if ( this.X == 0 && this.Y < this.mapHeight - 1 ) {
                this.direction = "right-down";
            } else if ( this.X > 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
            } else {
                this.X--;
                this.Y++;
            }
            break;
            
        case "down":
            if ( this.Y == this.mapHeight - 1 ) {
                this.direction = "up";
            } else {
                this.Y++;
            }
            break;
            
        case "right-down":
        case "down-right":
            if ( this.X == this.mapWidth - 1 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
            } else if ( this.X == this.mapWidth - 1 && this.Y < this.mapHeight -1  ) {
                this.direction = "left-down";
            } else if ( this.Y == this.mapHeight - 1 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-up";
            } else {
                this.X++;
                this.Y++;
            }
            break;
    }
    
    if ( currentDirection != this.direction ) {
        this.move();
    }
}

BouncyBullet.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "direction": this.direction, "type": "bouncyBullet"};
}

// =================================================== TANK ===================================================

function Tank(x, y, mapWidth, mapHeight, socketName, nickname) {
    this.X = x;
    this.Y = y;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.socketName = socketName;
    this.nickname = nickname;
    this.isDead = false;
}

Tank.prototype.move = function(direction) {
    switch ( direction ) {
        case "up":
            if ( this.Y != 0 ) {
                this.Y--;
            }
            break;
            
        case "down":
            if ( this.Y != this.mapHeight - 1 ) {
                this.Y++;
            }
            break;
            
        case "left":
            if ( this.X != 0 ) {
                this.X--;
            }
            break;
            
        case "right":
            if ( this.X != this.mapWidth - 1 ) {
                this.X++;
            }
            break;
    }
}

Tank.prototype.getJSON = function() {
    if ( this.isDead ) {
        return {"x": this.X, "y": this.Y, "socketName": this.socketName, "nickname": this.nickname, "isDead": true};
    } else {
        return {"x": this.X, "y": this.Y, "socketName": this.socketName, "nickname": this.nickname};
    }
}

// =================================================== MAP ===================================================

function Map() {
    this.players = null;
    this.width = 0;
    this.height = 0;
    this.tanks = new Array();
    this.bullets = new Array();
}

Map.prototype.generate = function(players) {
    
    this.players = players;
    this.width = 10 + random(10);
    this.height = 10 + random(10);
    
    for ( var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
        
        var x = ( tankIndex == 0 ) ? random(0, Math.floor(this.width / 2)) : random(Math.floor(this.width / 2), this.width);
        var y = ( tankIndex == 0 ) ? random(0, Math.floor(this.height / 2)) : random(Math.floor(this.height / 2), this.height);
        
        var newTank = new Tank(x, y, this.width, this.height, this.players[tankIndex]["socketName"], this.players[tankIndex]["nickname"]);
        this.tanks.push(newTank);
    }
}

Map.prototype.getJSON = function() {
    
    var tanksArray = new Array();
    for ( var tankIndex = 0; tankIndex < this.tanks.length; ++tankIndex ) {
        tanksArray[tankIndex] = this.tanks[tankIndex].getJSON();
    }
    
    var bulletsArray = new Array();
    for ( var bulletIndex = 0; bulletIndex < this.bullets.length; ++bulletIndex ) {
        bulletsArray[bulletIndex] = this.bullets[bulletIndex].getJSON();
    }
    
    return { "width":this.width, "height":this.height, "tanks":tanksArray, "bullets":bulletsArray };
}

// =================================================== GAME ===================================================

function Game() {
    this.players = new Array();
    this.map = new Map();
    this.turnCount = 0;
}

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
}

Game.prototype.startTurn = function() {
    this.turnCount += 1;
    for (var player in this.players) {
        this.players[player]["action"] = undefined;
    }
    broadcast({"method":"newTurn", "map":this.map.getJSON()});
    setTimeout(this.endTurn.bind(this), turnDelay);
}

Game.prototype.endTurn = function() {
    for (var player in this.players) {
        var action = this.players[player]["action"];
        
        for (var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
            var tank = this.map.tanks[tankIndex];
            if (tank["socketName"] == this.players[player]["socketName"]) {
                
                if ( action["shoot"] ) {                
                    
                    var newWeapon = Weapon(action["shoot"]["type"], tank["X"], tank["Y"], action["shoot"]["direction"], this.map.width, this.map.height, tank["socketName"]);
                    if ( newWeapon ) {
                        this.map["bullets"].push(newWeapon);
                    }
                }
                
                tank.move(action["move"]);

            }
        }
    }
    
    // Moving bullets
    
    var length = this.map["bullets"].length;
    for ( var bulletIndex = 0; bulletIndex < length; ++bulletIndex ) {
        if ( this.map["bullets"][bulletIndex].move() == -1 ) {
            this.map["bullets"].splice(bulletIndex,1);
            --length;
            --bulletIndex;
        }
    }
    
    // Checking collisions
    
    var deadTank = null;
    
    for ( var bulletIndex = 0; bulletIndex < this.map["bullets"].length; ++bulletIndex ) {
        for ( var tankIndex = 0; tankIndex < this.map["tanks"].length; ++tankIndex ) {
            
            var bullet = this.map["bullets"][bulletIndex];
            var tank = this.map["tanks"][tankIndex];
            
            if ( hasSameCoordinates(bullet, tank) && bullet["socketName"] != tank["socketName"] ) {
                this.map["tanks"][tankIndex]["isDead"] = true;
                deadTank = this.map["tanks"][tankIndex]["socketName"];
            }
        }
    }
    
    if ( deadTank ) {
        
        for ( var tankIndex = 0; tankIndex < this.map["tanks"].length; ++tankIndex ) {
            if ( this.map["tanks"][tankIndex]["socketName"] != deadTank ) {
                broadcast({"method":"endGame", "map":this.map.getJSON(), "winner":this.map["tanks"][tankIndex]["socketName"]});
            }
        }
        
    } else if ( this.turnCount < 500 ) {
        this.startTurn();
    } else {
        broadcast({"method":"endGame", "map":this.map.getJSON(), "winner":"draw"});
    }
}

Game.prototype.play = function() {
    
    this.map.generate(this.players);

    var playerNames = new Array();
    for ( var player in this.players ) {
        playerNames.push(this.players[player]["nickname"]);
    }
    
    broadcast({"method":"startGame", "map":this.map.getJSON(), "players":playerNames});

    this.turnCount = 0;
    this.startTurn();
}

// =================================================== TOURNAMENT ===================================================

function Tournament() {
    this.players = new Array();
    this.games = new Array();
}

Tournament.prototype.addPlayer = function(player) {
    this.players.push(player);
    if ( this.players.length == TOURNAMENT_EXPECTED_PLAYERS_COUNT ) {
        this.start();
    }
}

Tournament.prototype.start = function() {
    
    for ( var i = 0; i < this.players.length; ++i ) {
        for ( var j = 0; j < this.players.length; ++j ) {
            if ( j <= i ) {
                continue;
            }
            var newGame = new Game();
            newGame.addPlayer(this.players[i]);
            newGame.addPlayer(this.players[j]);
            this.games.push(newGame);
        }
    }
    
    shuffle(this.games);
    
    for ( var i = 0; i < this.games.length; ++i ) {
        this.games[i].play();
    }
}

// =================================================== SERVER ===================================================

var tournament  = new Tournament();
var turnDelay = 100;

var adminPassword = (1000000 * Math.random()).toString(16).substring(0, 5);
console.log("Admin password: " + adminPassword);

server.on('connection', function (client) {
  
  var socketName = generateSocketId();
  client["socketName"] = socketName;
  client.send(JSON.stringify({"method" : "hello", "socketName":socketName}));
  
  client.on('message', function (data) {
        var response = JSON.parse(data);
        if ( response["method"] == "name" ) {
            if (!client["nickname"]) {
                client["nickname"] = response["data"];
                tournament.addPlayer(client);
            }
        }
        else if (response["method"] == "action") {
            client["action"] = response["data"];
        }
        else if ( response["method"] == "admin" ) {
            if ( response["data"] == adminPassword ) {
                client["admin"] = true;
                client.send(JSON.stringify({"method": "passwordOK"}))
            }
            else {
                client.send(JSON.stringify({"method": "passwordWrong"}))
            }
        }
        else if ( response["method"] == "speedUp" ) {
            if ( client["admin"] == true ) {
                turnDelay = 0.75 * turnDelay;
                if (turnDelay < 100) {
                    turnDelay = 100;
                }
                console.log("turn delay decreased to " + turnDelay);
            }
        }
        else if ( response["method"] == "slowDown" ) {
            if ( client["admin"] == true ) {
                turnDelay = 1.25 * turnDelay;
                if (turnDelay > 1000) {
                    turnDelay = 1000;
                }
                console.log("turn delay increased to " + turnDelay);
            }
        }
  });
  
  client.on('close', function () {
  });
          
});

function broadcast(jsObject) {
    for ( var client in server.clients ) {
        server.clients[client].send(JSON.stringify(jsObject));
    }
}

function generateSocketId() {
    return "socket" + server.clientsCount;
}
