import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";
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
        this.game.mjSocket.socket.emit("updateLifeCharacter",{ id:id, life:life});

        // send to the player connected to the character
        playerSocket?.socket.emit("updateLifePlayer", ""+life);

        // send to the table
        //this.game.tableSocket.socket.emit("updateLifeCharacter",{id:id, life:life});
    }

    useSkill(playerId: string, skillId: number, targetId: string) {
        let playerSocket = this.findPlayerSocket(playerId);
        let playerCharacter = playerSocket!.player.character;
        let skill = playerCharacter.getSkill(skillId);

        if (skill == undefined) {
            let errorMessage = `Character ${playerCharacter.id} does not have skill ${skillId}.`;
            console.log(errorMessage);
            this.sendToSockets("errorMessage", errorMessage, [this.game.tableSocket.socket, this.game.mjSocket.socket]);
            return;
        }

        //TODO check if target exists once NPCs are done, using a player for now
        if (playerCharacter.isSkillUsable(skillId))
        {
            this.applySkill(playerCharacter, skill, targetId);
        }
    }

    applySkill(caster: CharacterInterface, skill: SkillInterface, targetId: string) {

    }

    findPlayerSocket(id: string) {
        return this.game.playerSockets.find(p => p.player.id === id);
    }

    public sendToSockets(message: string, data: string, sockets: Socket[]) {
        for (let socket of sockets) {
            socket.emit(message, data);
        }
    }
}
