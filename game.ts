import {socket} from "./sockets";
import * as Util from "./util";
import * as Roles from "./role";
import {Role, Faction}from "./role";
Roles.init ();

export type code = string;

let rooms: Record<code, Room> = {};



/* ROOM GENERATION */
export function createRoom (moderator: socket): code
{
    let newCode = generateCode ();
    while (hasRoom (newCode))
        newCode = generateCode ();

    rooms[newCode] = new Room (newCode, moderator);

    return newCode;
}

export function createPlayer (socket: socket, name: string): Player
{
    return new Player (socket, name);
}

export function hasRoom (joinCode: code): boolean
{
    return Object.keys (rooms).includes (joinCode);
}

export function getRoom (joinCode: code): Room
{
    if (!hasRoom (joinCode))
        return null;

    return rooms[joinCode];
}

function generateCode (): code
{
    return Math.random ().toString (36).substr (2, 4).replace (/\d/g, "X").toUpperCase ();
}
/* ROOM GENERATION END */



/* ROOMS */
export class Room
{
    joinCode: code;
    moderator: socket;
    players: Set<Player>;

    constructor (joinCode: code, moderator: socket)
    {
        this.joinCode = joinCode;
        this.moderator = moderator;
        this.players = new Set ();
    }

    addPlayer (player: Player): void
    {
        this.players.add (player);
        player.socket.join (this.joinCode);
    }

    removePlayer (player: Player): void
    {
        if (this.players.has (player))
        {
            this.players.delete (player);
            player.socket.leave (this.joinCode);
        }
    }

    removePlayerWithName (name: string): void
    {
        this.removePlayer (this.getPlayerWithName (name));
    }

    hasPlayerWithName (name: string): boolean
    {
        name = name.toLowerCase ();
        return Array.from (this.players).some (player => player.name.toLowerCase () == name);
    }

    getPlayerWithName (name: string): Player
    {
        name = name.toLowerCase ();
        return Array.from (this.players).filter (player => player.name.toLowerCase () == name)[0];
    }

    allocateRoles (game: object): void // game: Record<string, int> is a mapping of role name to frequency
    {
        let playerRoles: Role[] = Util.shuffle (Object.keys (game).reduce ((array, name) => array.concat (Array (parseInt (game[name])).fill (name)), [])).map (name => Roles.getRoles ()[name]);

        playerRoles.forEach ((role, i) => {
            Array.from (this.players)[i].role = role;
        });
    }

    getRoles (): Record<string, Role>
    {
        let results: Record<string, Role> = {};

        this.players.forEach ((player) => {
            results[player.name] = player.role;
        });

        return results;
    }

    close (): void
    {
        this.players.forEach (player => {
            this.removePlayer (player);
        });

        delete rooms[this.joinCode];
    }
}

export class Player
{
    socket: socket;
    name: string;
    role: Role;

    constructor (socket: socket, name: string)
    {
        this.socket = socket;
        this.name = name;
    }
}
/* ROOMS END */
