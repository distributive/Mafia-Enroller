"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var Game = require("./game");
var Roles = require("./role");
function init(io) {
    io.on("connection", function (socket) {
        // Send list of roles for the lobby-creation page
        socket.emit("setRoles", Roles.getRoles());
        var onCreateLobby = function () {
            var joinCode = Game.createRoom(socket);
            socket.emit("lobbyCreated", joinCode);
            socket.on("startGame", function (game) {
                var count = Object.keys(game).reduce(function (x, role) { return x + game[role]; }, 0);
                var playerCount = Game.getRoom(joinCode).players.size;
                if (playerCount == 0) {
                    socket.emit("gameRejected", "There are no players in the lobby.");
                }
                else if (count < playerCount) {
                    socket.emit("gameRejected", "You have provided fewer roles than there are players.");
                }
                else if (count > playerCount) {
                    socket.emit("gameRejected", "You have provided more roles than there are players.");
                }
                else {
                    socket.removeAllListeners("startGame");
                    Game.getRoom(joinCode).allocateRoles(game);
                    Game.getRoom(joinCode).players.forEach(function (player) {
                        player.socket.emit("setRole", player.role);
                    });
                    socket.emit("gameAccepted", Game.getRoom(joinCode).getRoles());
                    Game.getRoom(joinCode).close();
                }
            });
            var onLeave = function () {
                if (Game.hasRoom(joinCode)) {
                    Game.getRoom(joinCode).players.forEach(function (player) {
                        player.socket.emit("lobbyClosed");
                    });
                    Game.getRoom(joinCode).close();
                }
                socket.removeAllListeners("startGame");
                socket.removeAllListeners("returnedHome");
                socket.removeAllListeners("disconnect");
                socket.once("createLobby", onCreateLobby);
            };
            socket.once("returnedHome", onLeave);
            socket.once("disconnect", onLeave);
        };
        socket.once("createLobby", onCreateLobby);
        socket.on("joinLobby", function (name, joinCode) {
            if (!Game.hasRoom(joinCode)) {
                socket.emit("joinFailed", "There is no lobby with this join code.");
            }
            else if (Game.getRoom(joinCode).hasPlayerWithName(name)) {
                socket.emit("joinFailed", "This name is already in use in this lobby.");
            }
            else {
                Game.getRoom(joinCode).addPlayer(Game.createPlayer(socket, name));
                Game.getRoom(joinCode).moderator.emit("addPlayer", name);
                socket.emit("joinSuccessful");
                var onLeave = function () {
                    // This catches an error if the lobby is closed before the player leaves
                    // But if a new room is created with the same name, it will assume it's the original room (maybe fix?)
                    if (!Game.hasRoom(joinCode))
                        return;
                    Game.getRoom(joinCode).removePlayerWithName(name);
                    Game.getRoom(joinCode).moderator.emit("removePlayer", name);
                    socket.removeAllListeners("returnedHome");
                    socket.removeAllListeners("disconnect");
                };
                socket.once("returnedHome", onLeave);
                socket.once("disconnect", onLeave);
            }
        });
    });
}
exports.init = init;
