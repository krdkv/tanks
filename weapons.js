/* 
 * Weapons.
 */

function Weapon(type, x, y, direction, mapWidth, mapHeight, socketName) {
    if ( type == "bullet" ) {
        return new Bullet(x, y, direction, mapWidth, mapHeight, socketName);
    } else if ( type == "bouncyBullet" ) {
        return new BouncyBullet(x, y, direction, mapWidth, mapHeight, socketName);
    } else if ( type == "mine" ) {
        return new Mine(x, y, mapWidth, mapHeight, socketName);
    }
    return null;
}

function isOnMap(x, y, width, height) {
    if ( x >= 0 && x < width && y >= 0 && y < height ) {
        return true;
    }
    return false;
}

// =================================================== Mine ===================================================

function Mine(x, y, mapWidth, mapHeight, socketName) {
    this.X = x;
    this.Y = y;
    this.socketName = socketName;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
}

Mine.prototype.move = function(){}

Mine.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "type": "mine"};
}

// =================================================== Bullet ===================================================

function Bullet(x, y, direction, mapWidth, mapHeight, socketName) {
    this.X = x;
    this.Y = y;
    this.direction = direction;
    this.socketName = socketName;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
}

Bullet.prototype.move = function() {
    switch ( this.direction ) {
        case "up-left":
        case "left-up":
            this.X--;
            this.Y--;
            break;
            
        case "up":
            this.Y--;
            break;
            
        case "up-right":
        case "right-up":
            this.Y--;
            this.X++;
            break;
            
        case "left":
            this.X--;
            break;
            
        case "right":
            this.X++;
            break;
            
        case "left-down":
        case "down-left":
            this.X--;
            this.Y++;
            break;
            
        case "down":
            this.Y++;
            break;
            
        case "right-down":
        case "down-right":
            this.X++;
            this.Y++;
            break;
    }
    
    if ( ! isOnMap(this.X, this.Y, this.mapWidth, this.mapHeight) ) {
        return -1;
    }
}

Bullet.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "direction": this.direction, "type": "bullet"};
}

// =================================================== BouncyBullet ===================================================

function BouncyBullet(x, y, direction, mapWidth, mapHeight, socketName) {
    this.X = x;
    this.Y = y;
    this.direction = direction;
    this.socketName = socketName;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
}

BouncyBullet.prototype.move = function() {
    
    var currentDirection = this.direction;
    
    switch ( this.direction ) {
        case "up-left":
        case "left-up":
            if ( this.X == 0 && this.Y == 0 ) {
                this.direction = "down-right";
            } else if ( this.X == 0 && this.Y > 0 ) {
                this.direction = "right-up";
            } else if ( this.Y == 0 && this.X > 0 ) {
                this.direction = "left-down";
            } else {
                this.X--;
                this.Y--;
            }
            break;
            
        case "up":
            if ( this.Y == 0 ) {
                this.direction = "down";
            } else {
                this.Y--;
            }
            break;
            
        case "up-right":
        case "right-up":
            if ( this.X == this.mapWidth - 1 && this.Y == 0 ) {
                this.direction = "left-down";
            } else if ( this.X == this.mapWidth - 1 && this.Y > 0 ) {
                this.direction = "left-up";
            } else if ( this.Y == 0 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-down";
            } else {
                this.Y--;
                this.X++;
            }
            break;
        
        case "left":
            if ( this.X == 0 ) {
                this.direction = "right";
            } else {
                this.X--;
            }
            break;
            
        case "right":
            if ( this.X == this.mapWidth - 1 ) {
                this.direction = "left";
            } else {
                this.X++;
            }
            break;
            
        case "left-down":
        case "down-left":
            if ( this.X == 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "up-right";
            } else if ( this.X == 0 && this.Y < this.mapHeight - 1 ) {
                this.direction = "right-down";
            } else if ( this.X > 0 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
            } else {
                this.X--;
                this.Y++;
            }
            break;
            
        case "down":
            if ( this.Y == this.mapHeight - 1 ) {
                this.direction = "up";
            } else {
                this.Y++;
            }
            break;
            
        case "right-down":
        case "down-right":
            if ( this.X == this.mapWidth - 1 && this.Y == this.mapHeight - 1 ) {
                this.direction = "left-up";
            } else if ( this.X == this.mapWidth - 1 && this.Y < this.mapHeight -1  ) {
                this.direction = "left-down";
            } else if ( this.Y == this.mapHeight - 1 && this.X < this.mapWidth - 1 ) {
                this.direction = "right-up";
            } else {
                this.X++;
                this.Y++;
            }
            break;
    }
    
    if ( currentDirection != this.direction ) {
        this.move();
    }
}

BouncyBullet.prototype.getJSON = function() {
    return {"x": Number(this.X), "y": Number(this.Y), "socketName": this.socketName, "direction": this.direction, "type": "bouncyBullet"};
}

module.exports = Weapon;
