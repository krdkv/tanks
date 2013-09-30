var myName = Math.random().toString(36).substring(7);

function getName() {
    return myName;
}

function startGame(players, map) {
}

function newTurn(map) {
    
    var direction = ["up", "down", "left", "right"][Math.floor(Math.random()*4)];
    var shouldShoot = Math.floor(Math.random()*20) == 1;
    var shootObject = {};
    if ( shouldShoot ) {
        var shootDirection = ["up", "down", "left", "right", "left-up", "left-down", "right-up", "right-down"][Math.floor(Math.random()*8)];
        var bulletType = ["bullet", "bouncyBullet", "mine"][Math.floor(Math.random()*3)];
        shootObject = {"type":bulletType, "direction":shootDirection};
    }
        
    return {"move": direction, "shoot": shootObject  };
    
}