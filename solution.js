var myName = Math.random().toString(36).substring(7);
var dir = "up";

function getName() {
    return myName;
}

// players - Array of names

// map - JS Object
// map["width"]
// map["height"]

function startGame(players, map) {
}

function newTurn(map) {
    var myTank;
    for (var i=0; i<map.tanks.length; i++) {
        tank = map.tanks[i];
        console.log(tank);
        if (tank["nickname"] == myName) {
            myTank = tank;
            break;
        }
    }
    var myX = myTank["x"];
    var myY = myTank["y"];
    console.log("My position: " + myX + " " + myY);
    var dX = 0;
    var dY = 0;
    if (dir == "up") {
        if (myY > 0) {
            dY = -1;
        }
        else {
            dY = 1;
            dir = "down";
        }
    }
    else if (dir == "down") {
        if (myY < map["height"]-1) {
            dY = 1;
        }
        else {
            dY = -1;
            dir = "up";
        }
    }
    console.log("My action: " + dX + " " + dY);
    return {"deltaX": dX, "deltaY": dY};
}

// winner - String

function endGame(winner) {

}
