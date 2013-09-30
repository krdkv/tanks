/*
 * Tank.
 */

function Tank(x, y, mapWidth, mapHeight, socketName, nickname) {
    this.X = x;
    this.Y = y;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.socketName = socketName;
    this.nickname = nickname;
    this.isDead = false;
}

Tank.prototype.move = function(direction) {
    switch ( direction ) {
        case "up":
            if ( this.Y != 0 ) {
                this.Y--;
            }
            break;
            
        case "down":
            if ( this.Y != this.mapHeight - 1 ) {
                this.Y++;
            }
            break;
            
        case "left":
            if ( this.X != 0 ) {
                this.X--;
            }
            break;
            
        case "right":
            if ( this.X != this.mapWidth - 1 ) {
                this.X++;
            }
            break;
    }
}

Tank.prototype.getJSON = function() {
    if ( this.isDead ) {
        return {"x": this.X, "y": this.Y, "socketName": this.socketName, "nickname": this.nickname, "isDead": true};
    } else {
        return {"x": this.X, "y": this.Y, "socketName": this.socketName, "nickname": this.nickname};
    }
}

module.exports = Tank;

