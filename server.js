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

// =================================================== GAME ===================================================

function Game() {
    this.players = new Array();
}

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
}

Game.prototype.play = function() {
    var playersArray = new Array();
    for ( var player in this.players ) {
        playersArray.push(this.players[player]["nickname"]);
    }
    broadcast({"method":"endGame", "winner":this.players[Math.floor((Math.random()*this.players.length))]["nickname"], "players":playersArray});
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