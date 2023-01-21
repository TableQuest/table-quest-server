import Game from "../models/game";
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
        let playerSocket = this.findPlayerSocket(playerId);

        // apply changes
        let playerCharacter = playerSocket!.player.character;
        playerCharacter.updateInfo(variable, value);

        // emit to the player
        playerSocket?.socket.emit("updateInfoCharacter", { variable:variable, value:value });
        console.log(variable+value)

        // emit to the table
        this.game.tableSocket?.socket?.emit("updateInfoCharacter",{ playerId:playerId, variable:variable, value:value });

        // emit to the mj
        this.game.mjSocket?.socket.emit("updateInfoCharacter",{ playerId:playerId, variable:variable, value:value });
    }

    public updateInfoNpc(pawnCode: string, variable: string, value:string){
        let npc = this.game.npcTable.find(n => n.pawncode = pawnCode);

        if (npc){
            console.log("pawnCode "+ pawnCode+" variable "+variable+" value "+value);

            // apply change
            npc?.updateInfo(variable, value);

            // emit to the table
            this.game.tableSocket?.socket?.emit("updateInfoNpc", { "playerId":pawnCode, "variable":variable, "value":value });

            // emit to the mj
            this.game.mjSocket?.socket.emit("updateInfoNpc", JSON.stringify({ "pawnCode":pawnCode, "variable":variable, "value":value }));
        }

    }

    getPlayerSpeed(data: string): number {
        let playerSocket = this.game.playerSockets.find(p => p.player.id === data);
        return playerSocket?.player.character.speed!;
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
        let targetSocketPlayer = this.findPlayerSocket(targetId);
        let targetNpc = this.game.npcTable.find(n => n.pawncode === targetId)

        console.log("Try using skill");
        if (this.isSkillUsable(playerCharacter, skill, targetId) && this.game.turnOrder.isPlayerTurn(playerId)) {
            console.log("skill usable");
            this.applySkill(playerCharacter, skill!, targetId);
            this.game.turnOrder.checkIfTargetDead(targetId);
            let characterLife = targetSocketPlayer == null ? targetNpc!.life : targetSocketPlayer!.player.character.life;
            //doublon avec les appels de la méthode sendToSockets en dessous
            if(targetSocketPlayer != null) {
                this.updateInfoCharacter(targetId,"life",characterLife.toString())
                this.updateInfoCharacter(playerId,"mana",playerSocket!.player.character.mana.toString())
                this.updateInfoCharacter(targetId,"life",characterLife.toString())
                this.sendToSockets("updateInfoCharacter", {
                        playerId: targetId,
                        variable: "life",
                        value: characterLife
                    },
                    [this.game.mjSocket.socket, targetSocketPlayer!.socket]);
                this.sendToSockets("updateInfoCharacter", {
                        playerId: playerId,
                        variable: "mana",
                        value: playerSocket!.player.character.mana
                    },
                    [this.game.mjSocket.socket, playerSocket!.socket]);
            } else {
                console.log("THE ID is : " + targetId)
                this.updateInfoNpc(targetId,"life",characterLife.toString());
                this.updateInfoCharacter(playerId,"mana",playerSocket!.player.character.mana.toString());
            }
        }
    }

    /*
    Checks if the skill is defined, if the target exists and if the player has enough mana left. Returns true if so,
    false otherwise.
    Sends an error message to the table socket and the MJ socket if the skill is undefined.
    */
    isSkillUsable(playerCharacter: Character, skill: SkillInterface | undefined, targetId: string) {
        if (skill == undefined) {
            let errorMessage = `Character ${playerCharacter.id} does not have that skill.`;
            console.log(errorMessage);
            this.sendToSockets("errorMessage", errorMessage, [this.game.tableSocket.socket, this.game.mjSocket.socket]);
            return false;
        }
        return ((this.game.isPlayerExist(targetId) || this.game.isNpcExist(targetId)) && playerCharacter.hasEnoughMana(skill))
    }

    /*
    Affects the player and target's stats depending on the stats of the skill.
    */
    applySkill(caster: CharacterInterface, skill: SkillInterface, targetId: string) {
        caster.setMana(caster.mana - skill.manaCost);
        let targetCharacter = this.game.getEntity(targetId)!;

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
            socket?.emit(message, data);
        }
    }


}
