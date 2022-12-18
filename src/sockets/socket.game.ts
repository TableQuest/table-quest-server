import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";
import {Socket} from "socket.io";
import SkillInterface from "../models/interfaces/SkillInterface";
import CharacterInterface from "../models/interfaces/CharacterInterface";
import Character from "../models/character";
export default class GameSocket{

    game: Game;

    constructor(game: Game){
        this.game = game;
    }


    public updateInfoCharacter(playerId: string, variable: string, value: string){
        console.log("update info character "+ playerId + " "+ variable + " "+ value);
        let playerSocket = this.findPlayerSocket(playerId);
        // apply changement 
        let playerCharacter = playerSocket!.player.character;
        console.log(typeof playerCharacter);
        playerCharacter.updateInfo(variable, value);

        // emit to the player
        //playerSocket?.socket.emit("updateInfoCharacter", { variable:variable, value:value });

        // emit to the table
        //this.game.tableSocket.socket.emit("updateInfoCharacter",{ playerId:playerId, variable:variable, value:value });
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
