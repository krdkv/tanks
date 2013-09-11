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
}

Map.prototype.generate = function(players) {
    
    this.players = players;
    this.width = 10 + random(10);
    this.height = 10 + random(10);
    
    for ( var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
        var newTank = new Tank(this.players[tankIndex]["socketName"], this.players[tankIndex]["nickname"]);
        this.tanks.push(newTank);
    }
    
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
    
    return { "width":this.width, "height":this.height, "tanks":tanksArray };
}

// =================================================== GAME ===================================================

function Game() {
    this.players = new Array();
    this.map = new Map();
}

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
}

Game.prototype.startTurn = function() {
    this.turnCount += 1;
    console.log("turn " + this.turnCount);
    for (var player in this.players) {
        this.players[player]["action"] = undefined;
    }
    broadcast({"method":"newTurn", "map":this.map.getJSON()});
    setTimeout(this.endTurn.bind(this), 1000);
}

Game.prototype.endTurn = function() {
    for (var player in this.players) {
        var action = this.players[player]["action"];
        for (var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
            var tank = this.map.tanks[tankIndex];
            if (tank.nickname == this.players[player]["nickname"]) {
                var newX = tank.X + action["deltaX"];
                if (newX >= 0 && newX < this.map.width) {
                    tank.X = newX;
                }
                var newY = tank.Y + action["deltaY"];
                if (newY >= 0 && newY < this.map.height) {
                    tank.Y = newY;
                }
                console.log("Tank " + tank.nickname + " moved to " + tank.X + " " + tank.Y);
                break;
            }
        }
    }
    if (this.turnCount < 40) {
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
            console.log("action received:" + client["action"]);
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
