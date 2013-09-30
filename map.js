/*
 * Game map.
 */

var Tank = require("./tank.js");

function Map() {
    this.players = null;
    this.width = 0;
    this.height = 0;
    this.tanks = new Array();
    this.bullets = new Array();
}

// If only one argument is provided, than it will generate random number from 0 to left
// In other case it will generate number between left and right
function random(left, right) {
    if ( ! right ) {
        return Math.floor((Math.random()*left));
    } else {
        return Math.floor(left) + Math.floor((Math.random()*(right - left)));
    }
}

Map.prototype.generate = function(players) {
    
    this.players = players;
    this.width = 10 + random(10);
    this.height = 10 + random(10);
    
    for ( var tankIndex = 0; tankIndex < this.players.length; ++tankIndex ) {
        
        var x = ( tankIndex == 0 ) ? random(0, Math.floor(this.width / 2)) : random(Math.floor(this.width / 2), this.width);
        var y = ( tankIndex == 0 ) ? random(0, Math.floor(this.height / 2)) : random(Math.floor(this.height / 2), this.height);
        
        var newTank = new Tank(x, y, this.width, this.height, this.players[tankIndex]["socketName"], this.players[tankIndex]["nickname"]);
        this.tanks.push(newTank);
    }
}

Map.prototype.getJSON = function() {
    
    var tanksArray = new Array();
    for ( var tankIndex = 0; tankIndex < this.tanks.length; ++tankIndex ) {
        tanksArray[tankIndex] = this.tanks[tankIndex].getJSON();
    }
    
    var bulletsArray = new Array();
    for ( var bulletIndex = 0; bulletIndex < this.bullets.length; ++bulletIndex ) {
        bulletsArray[bulletIndex] = this.bullets[bulletIndex].getJSON();
    }
    
    return {"width" : this.width, "height" : this.height, "tanks" : tanksArray, "bullets" : bulletsArray};
}

module.exports = Map;
