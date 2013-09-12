var myName = Math.random().toString(36).substring(7);
var dir = "up";

function getName() {
    return myName;
}

function startGame(players, map) {
}

function newTurn(map) {
    
    var random = true;
    
    if ( ! random ) {
        var myTank;
        for (var i=0; i<map.tanks.length; i++) {
            tank = map.tanks[i];
            console.log(tank);
            if ( tank["mine"] ) {
                myTank = tank;
                break;
            }
        }
        var myX = myTank["x"];
        var myY = myTank["y"];
        
        if (dir == "up") {
            if ( myY == 0 ) {
                dir = "down";
            }
        }
        else if (dir == "down") {
            if ( myY == map["height"] - 1 ) {
                dir = "up";
            }
        }
        
        return {"move": dir};
        
    } else {
        
        return {"move": ["up", "down", "left", "right"][Math.floor(Math.random()*4)]};
        
    }
}

// winner - String

function endGame(winner) {

}
