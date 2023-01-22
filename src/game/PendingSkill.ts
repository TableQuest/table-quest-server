import Game from "../models/game";
import GameSocket from "../sockets/socket.game";
import PlayerSocket from "../sockets/socket.player";
import Character from "../models/character";
import SkillInterface from "../models/interfaces/SkillInterface";
import Npc from "../models/npc";


export default class PendingSkill {

    private game: Game;
    private playerId: string;
    private targetId: string;
    private skillId: number;


    constructor(game: Game, playerId: string, targetId: string, skillId: number) {
        this.game = game;
        this.playerId = playerId;
        this.targetId = targetId;
        this.skillId = skillId;
    }

    apply() {
        let playerSocket = this.game.gameSocket.findPlayerSocket(this.playerId);
        let playerCharacter = playerSocket!.player.character;
        let skill = playerCharacter.getSkill(this.skillId);
        let targetSocketPlayer = this.game.gameSocket.findPlayerSocket(this.targetId);
        let targetNpc = this.game.npcTable.find(n => n.pawncode === this.targetId);
        this.game.gameSocket.applySkill(playerCharacter, skill!, this.targetId);
        let characterLife = targetSocketPlayer == null ? targetNpc!.life : targetSocketPlayer!.player.character.life;
        if(targetSocketPlayer != null)
        {
            this.game.gameSocket.updateInfoCharacter(this.targetId,"life",characterLife.toString())
            this.game.gameSocket.updateInfoCharacter(this.playerId,"mana",playerSocket!.player.character.mana.toString())
            this.game.gameSocket.updateInfoCharacter(this.targetId,"life",characterLife.toString())
            this.game.gameSocket.sendToSockets("updateInfoCharacter", {
                    playerId: this.targetId,
                    variable: "life",
                    value: characterLife
                },
                [this.game.mjSocket.socket, targetSocketPlayer!.socket]);

            this.game.gameSocket.sendToSockets("updateInfoCharacter", {
                    playerId: this.playerId,
                    variable: "mana",
                    value: playerSocket!.player.character.mana
                },
                [this.game.mjSocket.socket, playerSocket!.socket]);
        }
        else
        {
            console.log("THE ID is : " + this.targetId)
            this.game.gameSocket.updateInfoNpc(this.targetId,"life",characterLife.toString());
            this.game.gameSocket.updateInfoCharacter(this.playerId,"mana",playerSocket!.player.character.mana.toString());
        }
        this.game.turnOrder.checkIfTargetDead(this.targetId);
    }
}