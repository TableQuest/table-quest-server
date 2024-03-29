import Game, {GameState} from "../models/game";
import {Socket} from "socket.io";
import SkillInterface from "../models/interfaces/SkillInterface";
import CharacterInterface from "../models/interfaces/CharacterInterface";
import Character from "../models/character";
import PendingSkill from "../game/PendingSkill";
export default class GameSocket{

    game: Game;
    pendingSkill: PendingSkill | undefined;

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
        let npc = this.game.npcTable.find(n => n.pawncode == pawnCode);

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
        let playerSocket = this.findPlayerSocket(playerId);
        let playerCharacter = playerSocket!.player.character;
        let skill = playerCharacter.getSkill(skillId);

        if (this.isSkillUsable(playerCharacter, skill, targetId) && this.game.turnOrder.isPlayerTurn(playerId))
        {
            this.game.tableSocket?.socket.emit("skillDice", {
                "playerId": playerId,
                "skillName": skill!.name,
                "targetValue": skill!.condition
            });
            this.game.gameSocket.sendHelp(
                `You must roll a dice to use ${skill!.name} !`,
                "",
                playerId,
                false
            );
            this.pendingSkill = new PendingSkill(this.game, playerId, targetId, skillId);
            console.log(`Waiting for the player ${playerId} to validate the skill ${skill!.name}.`);

            // this.applySkill(playerCharacter, skill!, targetId);
            // this.game.turnOrder.checkIfTargetDead(targetId);
            // let characterLife = targetSocketPlayer == null ? targetNpc!.life : targetSocketPlayer!.player.character.life;
            //
            // if(targetSocketPlayer != null)
            // {
            //     this.updateInfoCharacter(targetId,"life",characterLife.toString())
            //     this.updateInfoCharacter(playerId,"mana",playerSocket!.player.character.mana.toString())
            //     this.updateInfoCharacter(targetId,"life",characterLife.toString())
            //
            //     this.sendToSockets("updateInfoCharacter", {
            //             playerId: targetId,
            //             variable: "life",
            //             value: characterLife
            //         },
            //         [this.game.mjSocket.socket, targetSocketPlayer!.socket]);
            //
            //     this.sendToSockets("updateInfoCharacter", {
            //             playerId: playerId,
            //             variable: "mana",
            //             value: playerSocket!.player.character.mana
            //         },
            //         [this.game.mjSocket.socket, playerSocket!.socket]);
            // }
            // else
            // {
            //     console.log("THE ID is : " + targetId)
            //     this.updateInfoNpc(targetId,"life",characterLife.toString());
            //     this.updateInfoCharacter(playerId,"mana",playerSocket!.player.character.mana.toString());
            // }
        }
        else
        {
            this.game.logger.log("Images/information", "Information", "You cannot do this for now.")
                .sendTo(playerSocket!.socket);
        }
    }

    /*
    Checks if the skill is defined, if the target exists and if the player has enough mana left. Returns true if so,
    false otherwise.
    Sends an error message to the table socket and the MJ socket if the skill is undefined.
    */
    isSkillUsable(playerCharacter: Character, skill: SkillInterface | undefined, targetId: string) {
        if (skill == undefined) {
            this.game.logger.log("Images/error", "Error", `Character ${playerCharacter.id} does not have that skill.`)
                .sendTo(this.game.mjSocket.socket);
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
            this.game.logger.log(caster.image, caster.name,
                `Used ${skill.name} and healed ${skill.statModifier} HP to ${targetCharacter.name}! It cost ${skill.manaCost} MP.`
            ).sendToEveryone();
        }
        else {
            targetCharacter.setLife(targetCharacter.life - skill.statModifier);
            this.game.logger.log(caster.image, caster.name,
                `Used ${skill.name} and dealt ${skill.statModifier} of damage to ${targetCharacter.name}! It cost ${skill.manaCost} MP.`,
            ).sendToEveryone();
        }
        console.log(`Entity ${targetId}'s ${targetCharacter.name} now has ${targetCharacter.life} HP.`)
    }

    /**
     * Affect the target of a npc attacker depending on the stat of the skill
     */
    applySkillNpc(targetId: string, isTargetNpc:boolean, skill:SkillInterface){
        if (isTargetNpc) // the target is a npc
        {
            let targetNpc = this.game.npcTable.find( n => ( n.pawnCode == targetId))

            if (targetNpc != undefined){
                if (skill.healing){
                    targetNpc.setLife(targetNpc.life + skill.statModifier);
                    return targetNpc.life;
                }
                else{
                    targetNpc.setLife(targetNpc.life - skill.statModifier);
                    return targetNpc.life;
                }
            }
            else{
                console.log("Didn't find npc "+targetId);
                console.log(this.game.npcTable);
                return null;
            }

        }
        else // the target is a character
        {
            let targetCharacter = this.game.getPlayer(targetId)!.character;
            if (skill.healing){
                targetCharacter.setLife(targetCharacter.life + skill.statModifier);
                return targetCharacter.life;
            }
            else {
                targetCharacter.setLife(targetCharacter.life - skill.statModifier);
                return targetCharacter.life;
            }
        }


    }

    findPlayerSocket(id: string) {
        return this.game.playerSockets.find(p => p.player.id === id);
    }

    public sendToSockets(message: string, data: any, sockets: Socket[]) {
        for (let socket of sockets) {
            socket?.emit(message, data);
        }
    }

    public sendHelp(message: string, everyone: string, playerId: string, isTurn: boolean) {
        for (var playerSocket of this.game.playerSockets) {
            if (playerSocket.player.pawnCode === playerId) {
                playerSocket.socket.emit("helpTurn", {
                    "isTurn": isTurn,
                    "text": message
                });
            }
            else if (everyone != "") {
                playerSocket.socket.emit("helpTurn", {
                    "isTurn": false,
                    "text": everyone
                });
            }
        }
    }

}
