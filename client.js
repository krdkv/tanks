function displayTournamentInfo(response) {
    console.log("tournament data: " + JSON.stringify(response["players"]));
    $("#tournament-state").html("Tournament: " + response["state"]);
    console.log("Participants: " + response["players"].join(", "));
    $("#tournament-players").html("Participants: " + response["players"].join(", "));
    
    var gamesOverview = "";
    for ( var i=0; i<response["gamesHistory"].length; i++ ) {
        var gameInfo = response["gamesHistory"][i];
        gamesOverview += "<br/>" + gameInfo["players"].join(" - ") + ": " + gameInfo["winner"];
    }
    $("#tournament-games").html("Games: " + gamesOverview);

}

function drawMap(map) {

    var step = 40;

    $("#canvas").attr("width", 40 * map["width"]);
    $("#canvas").attr("height", 40 * map["height"]);

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    for ( var i = 0; i < map["width"] + 1; ++i ) {
        context.moveTo(i * step, 0);
        context.lineTo(i * step, step * map["height"]);
    }

    for ( var i = 0; i < map["height"] + 1; ++i ) {
        context.moveTo(0, i * step);
        context.lineTo(step * map["width"], i * step);
    }

    context.strokeStyle = "black";
    context.stroke();

    var deadTankX = -1, deadTankY = -1;

    for ( var tankIndex = 0; tankIndex < map["tanks"].length; ++tankIndex ) {
        var tank = map["tanks"][tankIndex];
        if ( tank["isDead"] ) {
            deadTankX = tank["x"];
            deadTankY = tank["y"];
            context.drawImage($("#fire").get(0), 40 * tank["x"], 40 * tank["y"]);
        } else {
            if ( isBlue(tank["socketName"]) ) {
                context.drawImage($("#tankBlue").get(0), 40 * tank["x"], 40 * tank["y"]);
            } else {
                context.drawImage($("#tank").get(0), 40 * tank["x"], 40 * tank["y"]);
            }
        }
    }

    for ( var bulletIndex in map["bullets"] ) {
        if ( map["bullets"][bulletIndex]["x"] != deadTankX && map["bullets"][bulletIndex]["y"] != deadTankY ) {

            var bullet = map["bullets"][bulletIndex];
            var x = 40 * bullet["x"];
            var y = 40 * bullet["y"];

            var imageId = "#" + bullet["type"] + (isBlue(bullet["socketName"]) ? "Blue" : "" );

            context.drawImage($(imageId).get(0), x, y);
        }
    }
}

