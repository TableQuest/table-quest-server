import Game from "../models/game";
import {Socket} from "socket.io";
import SkillInterface from "../models/interfaces/SkillInterface";
import CharacterInterface from "../models/interfaces/CharacterInterface";

export default class GameSocket{

    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    /**
     * When the mj remove life from the character:
     *  - update the character on the model
     *  - emit the change to the mj
     *  - emit the change to the player connected to the character
     */
    public updatePlayerLife(id:string, life:number){
        let playerSocket = this.findPlayerSocket(id);
        playerSocket!.player.character.life = life;
        console.log("Player "+playerSocket!.player.character.name+" has "+playerSocket!.player.character.life+" points of life");
        // send to the mj
        this.game.mjSocket.socket.emit("updateCharacter",{ id:id, life:life, mana: playerSocket!.player.character.mana});

        // send to the player connected to the character
        playerSocket?.socket.emit("updateLifePlayer", ""+life);

        // send to the table
        //this.game.tableSocket.socket.emit("updateLifeCharacter",{id:id, life:life});
    }

    /*
    Calls the function to check if the skill can be used and if so, calls the function to use it. Then it sends a message
    to update the character's stats to the MJ socket.
    Is called upon receiving the message "useSkill" from the Table socket.
     */
    tryUsingSkill(playerId: string, skillId: number, targetId: string) {
        let playerSocket = this.game.gameSocket.findPlayerSocket(playerId);
        let playerCharacter = playerSocket!.player.character;
        let skill = playerCharacter.getSkill(skillId);
        let targetSocket = this.findPlayerSocket(targetId);

        if (this.isSkillUsable(playerCharacter, skill, targetId)) {
            this.applySkill(playerCharacter, skill!, targetId);

            this.sendToSockets("updateCharacter", {id:targetId, life:targetSocket!.player.character.life, mana:targetSocket!.player.character.mana},
                [this.game.mjSocket.socket, targetSocket!.socket]);
            this.sendToSockets("updateCharacter", {id:targetId, life:playerSocket!.player.character.life,  mana:playerSocket!.player.character.mana},
                [this.game.mjSocket.socket, playerSocket!.socket]);
        }
    }

    /*
    Checks if the skill is defined, if the target exists and if the player has enough mana left. Returns true if so,
    false otherwise.
    Sends an error message to the table socket and the MJ socket if the skill is undefined.
     */
    isSkillUsable(playerCharacter: CharacterInterface, skill: SkillInterface | undefined, targetId: string) {
        if (skill == undefined) {
            let errorMessage = `Character ${playerCharacter.id} does not have that skill.`;
            console.log(errorMessage);
            this.sendToSockets("errorMessage", errorMessage, [this.game.tableSocket.socket, this.game.mjSocket.socket]);
            return false;
        }

        //TODO check if target exists once NPCs are done, using a player for now
        //TODO check skill range
        return (this.game.isPlayerExist(targetId) && playerCharacter.hasEnoughMana(skill))
    }

    /*
    Affects the player and target's stats depending on the stats of the skill.
     */
    applySkill(caster: CharacterInterface, skill: SkillInterface, targetId: string) {
        caster.setMana(caster.mana - skill.manaCost);
        let targetCharacter = this.game.getPlayer(targetId)!.character;

        //could be moved to Skill class, not sure as it would make it more annoying to read
        if (skill.healing) {
            targetCharacter.setLife(targetCharacter.life + skill.statModifier);
        }
        else {
            targetCharacter.setLife(targetCharacter.life - skill.statModifier);
        }
        console.log(`Entity ${targetId}'s ${targetCharacter.name} now has ${targetCharacter.life} HP.`)
    }

    findPlayerSocket(id: string) {
        return this.game.playerSockets.find(p => p.player.id === id);
    }

    public sendToSockets(message: string, data: any, sockets: Socket[]) {
        for (let socket of sockets) {
            socket.emit(message, data);
        }
    }
}
