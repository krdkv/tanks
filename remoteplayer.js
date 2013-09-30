/*
 * Proxy for a remote player. Communicates with the client via web sockets.
 */

var clientsCount = 0;

function RemotePlayer(client, adminPassword, tournament) {
    console.log("client is: " + client);
    this.client = client;
    this.tournament = tournament;
    clientsCount += 1;
    this.socketName = "socket" + clientsCount;
    this.admin = false;
    this.practiceMode = false;
    this.properPlayer = false;

    this.sendMessage = function(client, message) {
        console.log("Client proxy " + this.nickname + " sending to remote client: " + message);
        client.send(JSON.stringify(message));
    }.bind(this);

    this.sendMessage(this.client, {"method" : "hello", "socketName" : this.socketName});

    client.on("message", function (data) {
        var response = JSON.parse(data);

        if ( response["method"] == "name" ) {
            if (!this.nickname) {
                this.properPlayer = true;
                this.nickname = response["data"];
            }
            if ( response["mode"] == "practice" ) {
                this.practiceMode = true;
            }
        }
        else if ( response["method"] == "action" ) {
            this.action = response["data"];
        }
        else if ( response["method"] == "admin" ) {
            if ( response["data"] == adminPassword ) {
                this.admin = true;
                this.sendMessage(this.client, {"method": "passwordOK"});
            }
            else {
                this.sendMessage(this.client, {"method": "passwordWrong"});
            }
        }
        else if ( response["method"] == "speedUp" ) {
            if ( this.admin == true ) {
                this.tournament.changeSpeed(0.75);
            }
        }
        else if ( response["method"] == "slowDown" ) {
            if ( this.admin == true ) {
                this.tournament.changeSpeed(1.25);
            }
        }
        else if ( response["method"] == "startTournament" ) {
            if ( this.admin == true ) {
                this.tournament.start();    
            }
        }
    }.bind(this));

    client.on("close", function () {
        console.log("Client " + this.nickname + " disconnected.");
    });
}

RemotePlayer.prototype.isProperPlayer = function() {
    return !this.admin;
}

RemotePlayer.prototype.getNickname = function() {
    return this.nickname;
}

RemotePlayer.prototype.clearAction = function() {
    this.action = undefined;
}

RemotePlayer.prototype.getAction = function() {
    return this.action;
}

RemotePlayer.prototype.tournamentInfo = function(tournamentPlayers, tournamentState, gamesHistory) {
    this.sendMessage(this.client, {"method" : "tournamentInfo", "players" : tournamentPlayers, "state" : tournamentState, "gamesHistory" : gamesHistory});
}

RemotePlayer.prototype.startGame = function(map, gamePlayers) {
    this.sendMessage(this.client, {"method" : "startGame", "map" : map.getJSON(), "players" : gamePlayers});
}

RemotePlayer.prototype.newTurn = function(map) {
    this.sendMessage(this.client, {"method" : "newTurn", "map" : map.getJSON()});
}

RemotePlayer.prototype.endGame = function(map, winner) {
    this.sendMessage(this.client, {"method" : "endGame", "map" : map.getJSON(), "winner" : winner});
}

module.exports = RemotePlayer;
