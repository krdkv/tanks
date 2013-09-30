/*
 * Game.
 */
var Map = require("./map.js");
var Weapon = require("./weapons.js");

function Game(tournament) {
    this.tournament = tournament;
    this.players = new Array();
    this.map = new Map();
    this.turnCount = 0;
}

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
}

Game.prototype.startTurn = function() {
    this.turnCount += 1;
    for ( var i=0; i<this.players.length; ++i ) {
        this.players[i].clearAction();
    }
    this.tournament.sendGameNewTurn(this.map);
    setTimeout(this.endTurn.bind(this), this.tournament.turnDelay);
}

function hasSameCoordinates(object1, object2) {
    return object1["X"] == object2["X"] && object1["Y"] == object2["Y"];
}

Game.prototype.endTurn = function() {
    for ( var playerIndex=0; playerIndex < this.players.length; ++playerIndex ) {
        var action = this.players[playerIndex].action;

        for (var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
            var tank = this.map.tanks[tankIndex];
            if (tank["socketName"] == this.players[playerIndex]["socketName"]) {
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
                this.tournament.sendGameEnd(this.map, this.map["tanks"][tankIndex]["socketName"]);
            }
        }
    } else if ( this.turnCount < 500 ) {
        this.startTurn();
    } else {
        this.tournament.sendGameEnd(this.map, "draw");
    }
}

Game.prototype.play = function() {
    
    this.map.generate(this.players);

    var playerNames = new Array();
    for ( var i=0; i<this.players.length; ++i ) {
        playerNames.push(this.players[i].nickname);
    }
    this.tournament.sendGameStart(this.map, playerNames);

    this.turnCount = 0;
    this.startTurn();
}

module.exports = Game;
