/*
 * Dummy player simulated by the server, for practice mode.
 */

function SimulatedPlayer() {
}

SimulatedPlayer.prototype.isProperPlayer = function() {
    return true;
}

SimulatedPlayer.prototype.getNickname = function() {
    return "Server Training Bot";
}

SimulatedPlayer.prototype.clearAction = function() {
    this.action = undefined;
}

SimulatedPlayer.prototype.getAction = function() {
    return this.action;
}

SimulatedPlayer.prototype.tournamentInfo = function(tournamentPlayers, tournamentStatus, gamesHistory) {
}

SimulatedPlayer.prototype.startGame = function(map, gamePlayers) {
}

SimulatedPlayer.prototype.newTurn = function(map) {
}

SimulatedPlayer.prototype.endGame = function(map, winner) {
}

module.exports = SimulatedPlayer;
