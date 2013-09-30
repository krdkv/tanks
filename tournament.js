/*
 * Tournament.
 */
var Game = require("./game.js");

function Tournament() {
    this.players = new Array();
    this.games = new Array();
    this.turnDelay = 100;
    this.state = "not started";
    this.gamesHistory = new Array();
    this.nextGameIndex = 0;
}

Tournament.prototype.addPlayer = function(player) {
    if ( this.state == "not started" ) {
        this.players.push(player);
        this.sendTournamentInfo();
    }
}

function shuffle(array) {
    var i = array.length;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

Tournament.prototype.start = function() {
    if ( this.players.length >= 2 ) {
        if ( this.state == "not started" ) {
            this.state = "started";
            this.sendTournamentInfo();

            for ( var i = 0; i < this.players.length-1; ++i ) {
                for ( var j = i+1; j < this.players.length; ++j ) {
                    if (this.players[i].isProperPlayer() && this.players[j].isProperPlayer()) {
                        var newGame = new Game(this);
                        newGame.addPlayer(this.players[i]);
                        newGame.addPlayer(this.players[j]);
                        this.games.push(newGame);
                    }
                }
            }

            shuffle(this.games);

            this.games[this.nextGameIndex++].play();

            this.state = "finished";
            this.sendTournamentInfo();
        }
    }
}

Tournament.prototype.sendTournamentInfo = function() {
    var playerNames = new Array();
    for ( var i=0; i<this.players.length; ++i ) {
        if (this.players[i].isProperPlayer()) {
            playerNames.push(this.players[i].getNickname());
        }
    }

    for ( var i=0; i<this.players.length; ++i ) {
        this.players[i].tournamentInfo(playerNames, this.state, this.gamesHistory);
    }
}

Tournament.prototype.sendGameStart = function(map, gamePlayerNames) {
    this.gamesHistory.push({"players" : gamePlayerNames, "winner": "game in progress"});
    this.sendTournamentInfo();
    for ( var i=0; i<this.players.length; ++i ) {
        this.players[i].startGame(map, gamePlayerNames);
    }
}

Tournament.prototype.sendGameNewTurn = function(map) {
    for ( var i=0; i<this.players.length; ++i ) {
        this.players[i].newTurn(map);
    }
}

Tournament.prototype.sendGameEnd = function(map, winner) {
    var winnerNickname = winner;
    for ( var i=0; i<this.players.length; ++i ) {
        if (this.players[i]["socketName"] == winner ) {
            winnerNickname = this.players[i].getNickname();
        }
    }
    this.gamesHistory[this.gamesHistory.length-1]["winner"] = winnerNickname;
    this.sendTournamentInfo();
    for ( var i=0; i<this.players.length; ++i ) {
        this.players[i].endGame(map, winner);
    }

    if (this.nextGameIndex < this.games.length) {
        this.games[this.nextGameIndex++].play();
    }
}

Tournament.prototype.changeSpeed = function(factor) {
    this.turnDelay = factor * this.turnDelay;
    if ( this.turnDelay < 100 ) {
        this.turnDelay = 100;
    }
    if ( this.turnDelay > 1000 ) {
        this.turnDelay = 1000;
    }
    console.log("Turn delay changed with a factor of " + factor + ", now it is " + this.turnDelay + ".");
}

module.exports = Tournament;
