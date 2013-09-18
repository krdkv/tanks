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

// =================================================== BULLET ===================================================

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
            if ( this.X == 0 && this.Y == 0 ) {
                this.direction = "down-right";
                this.X++;
                this.Y++;
            } else if ( this.X == 0 && this.Y > 0 ) {
                this.direction = "right-up";
                this.Y--;
                this.X++;
            } else if ( this.Y == 0 && this.X > 0 ) {
                this.direction = "left-down";
                this.X--;
                this.Y++;
            } else {
                this.X--;
                this.Y--;
            }
            break;
            
        case "up":
            if ( this.Y == 0 ) {
                this.Y++;
                this.direction = "down";
            } else {
                this.Y--;
            }
            break;
            
        case "up-right":
        case "right-up":
            if ( this.X == this.mapWidth - 1 && this.Y == 0 ) {
                this.direction = "left-down";
                this.X--;
                this.Y++;
            } else if ( this.X == this.mapWidth - 1 && this.Y > 0 ) {
                this.direction = "left-up";
                this.Y--;
                this.X--;
            } else if ( this.Y == 0 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-down";
                this.X++;
                this.Y++;
            } else {
                this.Y--;
                this.X++;
            }
            break;
        
        case "left":
            if ( this.X == 0 ) {
                this.X++;
                this.direction = "right";
            } else {
                this.X--;
            }
            break;
            
        case "right":
            if ( this.X == this.mapWidth - 1 ) {
                this.X--;
                this.direction = "left";
            } else {
                this.X++;
            }
            break;
            
        case "left-down":
        case "down-left":
            if ( this.X == 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "up-right";
                this.Y--;
                this.X++;
            } else if ( this.X == 0 && this.Y < this.mapHeight - 1 ) {
                this.direction = "right-down";
                this.X++;
                this.Y++;
            } else if ( this.X > 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
                this.X--;
                this.Y--;
            } else {
                this.X--;
                this.Y++;
            }
            break;
            
        case "down":
            if ( this.Y == this.mapHeight - 1 ) {
                this.direction = "up";
                this.Y--;
            } else {
                this.Y++;
            }
            break;
            
        case "right-down":
        case "down-right":
            if ( this.X == this.mapWidth - 1 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
                this.X--;
                this.Y--;
            } else if ( this.X == this.mapWidth - 1 && this.Y < this.mapHeight -1  ) {
                this.direction = "left-down";
                this.X--;
                this.Y++;
            } else if ( this.Y == this.mapHeight - 1 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-up";
                this.X++;
                this.Y--;
            } else {
                this.X++;
                this.Y++;
            }
            break;
    }
}

Bullet.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "direction": this.direction};
}

// =================================================== TANK ===================================================

function Tank(socketName, nickname) {
    this.X;
    this.Y;
    this.socketName = socketName;
    this.nickname = nickname;
}

Tank.prototype.getJSON = function() {
    return {"x": this.X, "y": this.Y, "socketName": this.socketName, "nickname": this.nickname};
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
        var newTank = new Tank(this.players[tankIndex]["socketName"], this.players[tankIndex]["nickname"]);
        this.tanks.push(newTank);
    }
    
    this.bullets.push(new Bullet(5, 0, "right-down", this.width, this.height, this.players[0]["socketName"]));
    this.bullets.push(new Bullet(4, 4, "left", this.width, this.height, this.players[0]["socketName"]));
    this.bullets.push(new Bullet(3, 1, "left-up", this.width, this.height, this.players[0]["socketName"]));
    
    // Only for two tanks
    
    this.tanks[0].X = random(0, Math.floor(this.width / 2));
    this.tanks[0].Y = random(0, Math.floor(this.height / 2));
    
    this.tanks[1].X = random(Math.floor(this.width / 2), this.width);
    this.tanks[1].Y = random(Math.floor(this.height / 2), this.height);
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
    setTimeout(this.endTurn.bind(this), 100);
}

Game.prototype.endTurn = function() {
    for (var player in this.players) {
        var action = this.players[player]["action"];
        
        for (var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
            var tank = this.map.tanks[tankIndex];
            if (tank["socketName"] == this.players[player]["socketName"]) {
                
                switch ( action["move"] ) {
                        case "up":
                            if ( tank["Y"] - 1 >= 0 ) {
                                tank["Y"]--;
                            }
                            break;
                        case "down":
                            if ( tank["Y"] + 1 < this.map["height"] ) {
                                tank["Y"]++;
                            }
                            break;
                        case "left":
                            if ( tank["X"] - 1 >= 0 ) {
                                tank["X"]--;
                            }
                            break;
                        case "right":
                            if ( tank["X"] + 1 < this.map["width"] ) {
                                tank["X"]++;
                            }
                            break;
                }
            }
        }
    }
    
    for ( var bulletIndex = 0; bulletIndex < this.map["bullets"].length; ++bulletIndex ) {
        this.map["bullets"][bulletIndex].move();
    }
    
    if (this.turnCount < 500) {
        this.startTurn();
    }
    else {
        broadcast({"method":"endGame", "map":this.map.getJSON(), "winner":this.players[random(this.players.length)]["nickname"]});
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
