import * as Game from "./game";
import {code, Room, Player} from "./game";
import * as Roles from "./role";
import {Role, Faction} from "./role";
import * as Util from "./util";

export type socket = any;

export function init (io)
{
    io.on ("connection", socket => {

        // Send list of roles for the lobby-creation page
        socket.emit ("setRoles", Roles.getRoles ());

        let onCreateLobby = () => {
            let joinCode: code = Game.createRoom (socket);
            socket.emit ("lobbyCreated", joinCode);

            socket.on ("startGame", (game) => {
                let count = Object.keys (game).reduce ((x, role) => x + game[role], 0);
                let playerCount = Game.getRoom (joinCode).players.size;

                if (playerCount == 0)
                {
                    socket.emit ("gameRejected", "There are no players in the lobby.");
                }
                else if (count < playerCount)
                {
                    socket.emit ("gameRejected", "You have provided fewer roles than there are players.");
                }
                else if (count > playerCount)
                {
                    socket.emit ("gameRejected", "You have provided more roles than there are players.");
                }
                else
                {
                    socket.removeAllListeners ("startGame");

                    Game.getRoom (joinCode).allocateRoles (game);
                    Game.getRoom (joinCode).players.forEach (player => {
                        player.socket.emit ("setRole", player.role);
                    });

                    socket.emit ("gameAccepted", Game.getRoom (joinCode).getRoles ());

                    Game.getRoom (joinCode).close ();
                }
            });

            let onLeave = () => {
                if (Game.hasRoom (joinCode))
                {
                    Game.getRoom (joinCode).players.forEach (player => {
                        player.socket.emit ("lobbyClosed");
                    });
                    Game.getRoom (joinCode).close ();
                }

                socket.removeAllListeners ("startGame");
                socket.removeAllListeners ("returnedHome");
                socket.removeAllListeners ("disconnect");

                socket.once ("createLobby", onCreateLobby);
            }
            socket.once ("returnedHome", onLeave);
            socket.once ("disconnect", onLeave);
        };
        socket.once ("createLobby", onCreateLobby);



        socket.on ("joinLobby", (name: string, joinCode: code) => {
            if (!Game.hasRoom (joinCode))
            {
                socket.emit ("joinFailed", "There is no lobby with this join code.");
            }
            else if (Game.getRoom (joinCode).hasPlayerWithName (name))
            {
                socket.emit ("joinFailed", "This name is already in use in this lobby.");
            }
            else
            {
                Game.getRoom (joinCode).addPlayer (Game.createPlayer (socket, name));
                Game.getRoom (joinCode).moderator.emit ("addPlayer", name);
                socket.emit ("joinSuccessful");

                let onLeave = () => {
                    // This catches an error if the lobby is closed before the player leaves
                    // But if a new room is created with the same name, it will assume it's the original room (maybe fix?)
                    if (!Game.hasRoom (joinCode))
                        return;

                    Game.getRoom (joinCode).removePlayerWithName (name);
                    Game.getRoom (joinCode).moderator.emit ("removePlayer", name);

                    socket.removeAllListeners ("returnedHome");
                    socket.removeAllListeners ("disconnect");
                };
                socket.once ("returnedHome", onLeave);
                socket.once ("disconnect", onLeave);
            }
        });
    });
}
