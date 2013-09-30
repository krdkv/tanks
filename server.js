var Tournament = require("./tournament.js");
var RemotePlayer = require("./remoteplayer.js");
var SimulatedPlayer = require("./simulatedplayer.js");

var ws = require('websocket.io')
, server = ws.listen(3000);

var tournament = new Tournament();

var adminPassword = (1000000 * Math.random()).toString(16).substring(0, 5);
console.log("Admin password: " + adminPassword);

server.on("connection", function (client) {
    player = new RemotePlayer(client, adminPassword, tournament);
    setTimeout(function() {
            if ( player["practiceMode"] ) {
                console.log("Client " + player.getNickname() + " connected in practice mode.");
            }
            else {
                console.log("Client " + player.getNickname() + " connected in fight mode.");
                tournament.addPlayer(player);
            }
        
    }, 300);
});

