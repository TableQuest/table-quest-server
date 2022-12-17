import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";
import {Socket} from "socket.io";
import SkillInterface from "../models/interfaces/SkillInterface";
import CharacterInterface from "../models/interfaces/CharacterInterface";
import PlayerSocket from "./socket.player";
import Skill from "../models/skill";

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
        this.game.mjSocket.socket.emit("updateLifeCharacter",{ id:id, life:life});

        // send to the player connected to the character
        playerSocket?.socket.emit("updateLifePlayer", ""+life);

        // send to the table
        //this.game.tableSocket.socket.emit("updateLifeCharacter",{id:id, life:life});
    }

    tryUsingSkill(playerId: string, skillId: number, targetId: string) {
        let playerSocket = this.game.gameSocket.findPlayerSocket(playerId);
        let playerCharacter = playerSocket!.player.character;
        let skill = playerCharacter.getSkill(skillId);
        let targetSocket = this.findPlayerSocket(targetId);

        if (this.isSkillUsable(playerCharacter, skill!, targetId)) {
            this.applySkill(playerCharacter, skill!, targetId);
            //TODO create a global updateCharacter message
            this.sendToSockets("updateLifeCharacter", {id:targetId, life:targetSocket!.player.character.life},
                [this.game.mjSocket.socket]);
            this.sendToSockets("updateManaCharacter", {id:targetId, mana:playerSocket!.player.character.mana},
                [this.game.mjSocket.socket]);
        }
    }

    isSkillUsable(playerCharacter: CharacterInterface, skill: SkillInterface, targetId: string) {
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

    applySkill(caster: CharacterInterface, skill: SkillInterface, targetId: string) {
        caster.mana -= skill.manaCost;
        let targetCharacter = this.game.getPlayer(targetId)!.character;

        //could be moved to Skill class, not sure as it would make it more annoying to read
        if (skill.healing) {
            targetCharacter.life += skill.statModifier;
        }
        else {
            targetCharacter.life -= skill.statModifier;
        }
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
