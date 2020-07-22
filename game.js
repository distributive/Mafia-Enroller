"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Room = exports.getRoom = exports.hasRoom = exports.createPlayer = exports.createRoom = void 0;
var Util = require("./util");
var Roles = require("./role");
Roles.init();
var rooms = {};
/* ROOM GENERATION */
function createRoom(moderator) {
    var newCode = generateCode();
    while (hasRoom(newCode))
        newCode = generateCode();
    rooms[newCode] = new Room(newCode, moderator);
    return newCode;
}
exports.createRoom = createRoom;
function createPlayer(socket, name) {
    return new Player(socket, name);
}
exports.createPlayer = createPlayer;
function hasRoom(joinCode) {
    return Object.keys(rooms).includes(joinCode);
}
exports.hasRoom = hasRoom;
function getRoom(joinCode) {
    if (!hasRoom(joinCode))
        return null;
    return rooms[joinCode];
}
exports.getRoom = getRoom;
function generateCode() {
    return Math.random().toString(36).substr(2, 4).replace(/\d/g, "X").toUpperCase();
}
/* ROOM GENERATION END */
/* ROOMS */
var Room = /** @class */ (function () {
    function Room(joinCode, moderator) {
        this.joinCode = joinCode;
        this.moderator = moderator;
        this.players = new Set();
    }
    Room.prototype.addPlayer = function (player) {
        this.players.add(player);
        player.socket.join(this.joinCode);
    };
    Room.prototype.removePlayer = function (player) {
        if (this.players.has(player)) {
            this.players.delete(player);
            player.socket.leave(this.joinCode);
        }
    };
    Room.prototype.removePlayerWithName = function (name) {
        this.removePlayer(this.getPlayerWithName(name));
    };
    Room.prototype.hasPlayerWithName = function (name) {
        name = name.toLowerCase();
        return Array.from(this.players).some(function (player) { return player.name.toLowerCase() == name; });
    };
    Room.prototype.getPlayerWithName = function (name) {
        name = name.toLowerCase();
        return Array.from(this.players).filter(function (player) { return player.name.toLowerCase() == name; })[0];
    };
    Room.prototype.allocateRoles = function (game) {
        var _this = this;
        var playerRoles = Util.shuffle(Object.keys(game).reduce(function (array, name) { return array.concat(Array(parseInt(game[name])).fill(name)); }, [])).map(function (name) { return Roles.getRoles()[name]; });
        playerRoles.forEach(function (role, i) {
            Array.from(_this.players)[i].role = role;
        });
    };
    Room.prototype.getRoles = function () {
        var results = {};
        this.players.forEach(function (player) {
            results[player.name] = player.role;
        });
        return results;
    };
    Room.prototype.close = function () {
        var _this = this;
        this.players.forEach(function (player) {
            _this.removePlayer(player);
        });
        delete rooms[this.joinCode];
    };
    return Room;
}());
exports.Room = Room;
var Player = /** @class */ (function () {
    function Player(socket, name) {
        this.socket = socket;
        this.name = name;
    }
    return Player;
}());
exports.Player = Player;
/* ROOMS END */
