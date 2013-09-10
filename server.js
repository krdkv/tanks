var ws = require('websocket.io')
, server = ws.listen(3000);

var TOURNAMENT_EXPECTED_PLAYERS_COUNT = 3;

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

function random(left, right) {
    if ( ! right ) {
        return Math.floor((Math.random()*left));
    } else {
        return left + Math.floor((Math.random()*(right - left)));
    }
}

// =================================================== TANK ===================================================

function Tank() {
    this.X;
    this.Y;
}

// =================================================== MAP ===================================================

function Map() {
    this.numberOfPlayers = 0;
    this.width = 0;
    this.height = 0;
    this.tanks = new Array();
}

Map.prototype.generate = function(numberOfPlayers) {
    
    this.numberOfPlayers = numberOfPlayers;
    this.width = 10 + random(10);
    this.height = 10 + random(10);
    
    // Only the case of two players
    
//    var firstPlayerX = random(0, Math.floor(this.width/2));
//    var firstPlayerY = random(0, Math.floor(this.height/2));
}

Map.prototype.getJSON = function() {
    return { "width":this.width, "height":this.height };
}

// =================================================== GAME ===================================================

function Game() {
    this.players = new Array();
    this.map = new Map();
}

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
}

Game.prototype.play = function() {
    
    this.map.generate(this.players.length);

    var playerNames = new Array();
    for ( var player in this.players ) {
        playerNames.push(this.players[player]["nickname"]);
    }
    
    broadcast({"method":"startGame", "map":this.map.getJSON(), "players":playerNames});
    
    broadcast({"method":"endGame", "winner":this.players[random(this.players.length)]["nickname"]});
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
        
  client.send(JSON.stringify({"method" : "hello"}));
  
  client.on('message', function (data) {
        var response = JSON.parse(data);
        if ( response["method"] == "name" ) {
            client["nickname"] = response["data"];
            tournament.addPlayer(client);
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