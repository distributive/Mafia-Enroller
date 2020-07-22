export function init ()
{
    new Role ("Vanilla Town", "You have no special abilities.", townCondition, Faction.town);
    new Role ("Cop", "During the night you may choose another player and find out their alignment.", townCondition, Faction.town);
    new Role ("Doctor", "During the night you may choose another player and prevent a kill on them.", townCondition, Faction.town);
    new Role ("Mason", "At the start of the game, you see all other masons.", townCondition, Faction.town);
    new Role ("Tracker", "During the night you may choose another player and see who, if anyone, they visit.", townCondition, Faction.town);
    new Role ("Watcher", "During the night you may choose another player and see who, if anyone, visits them.", townCondition, Faction.town);
    new Role ("Vigilante", "During the night you may kill another player.", townCondition, Faction.town);
    new Role ("Veteran", "During the night you may choose to go active. Any player who targets you during a night you are active dies.", townCondition, Faction.town);
    new Role ("Bus Driver", "During the night you may choose two other players. Anyone who targets one targets the other instead.", townCondition, Faction.town);

    new Role ("Mafia Goon", "You know the other mafia. During the night you may collectively choose another player to kill.", mafiaCondition, Faction.mafia);
    new Role ("Mafia Godfather", "You appear as town to cop checks.", mafiaCondition, Faction.mafia);
    new Role ("Mafia Mason", "At the start of the game, you see all other masons.", mafiaCondition, Faction.mafia);
    new Role ("Mafia Bus Driver", "During the night you may choose two other players. Anyone who targets one targets the other instead.", mafiaCondition, Faction.mafia);

    new Role ("Werewolf", "You know the other werewolves. During the night you may collectively choose another player to kill.", werewolfCondition, Faction.werewolf);

    new Role ("Alien Goon", "You know the other aliens. During the night you may collectively choose another player to kill.", alienCondition, Faction.alien);

    new Role ("Jester", "", "You win if you are lynched.", Faction.neutral);
    new Role ("Serial Killer", "During the night you may kill another player.", "You win if you are the last player alive.", Faction.neutral);
    new Role ("Survivor", "", "You win if you are not dead at the end of the game.", Faction.neutral);

    new Role ("Cult Leader", "During the night you may choose another player to recruit them into the Cult.", cultCondition, Faction.cult);
    new Role ("Cultist", "You are a member of the Cult.", cultCondition, Faction.cult);
}



let townCondition = "You win when all anti-town players are dead.";
let mafiaCondition = "You win when all other factions are dead.";
let werewolfCondition = "You win when all other factions are dead.";
let alienCondition = "You win when all other factions are dead.";
let cultCondition = "You win when all living players are cultists.";



// Role structures
export class Role
{
    title: string;
    description: string;
    condition: string;
    faction: Faction;

    constructor (title: string, description: string, condition: string, faction: Faction)
    {
        this.title = title;
        this.description = description;
        this.condition = condition;
        this.faction = faction;

        roles[title] = this;
    }
}

export enum Faction {town = "town", mafia = "mafia", werewolf = "werewolf", alien = "alien", neutral = "neutral", cult = "cult"}



// List of roles
let roles: Record<string, Role> = {};

export function getRoles ()
{
    return roles;
}
