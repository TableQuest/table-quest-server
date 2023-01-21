import {Server, Socket} from "socket.io";
import Game, {GameState} from "../models/game";
import MJ from "../models/mj";
import Npc from "../models/npc";
import Skill from "../models/skill";


/**
 * Handle events coming from the MJ`s device.
 */
export default class MJSocket {

    game: Game;
    isEnable: boolean;
    io: Server;
    socket: Socket;

    mj: MJ;

    constructor(game: Game, io: Server) {
        this.game = game;
        this.isEnable = false;
        this.io = io;

        this.mj = new MJ();
    }

    initWebSocket(socket: Socket) {
        this.socket = socket;
        this.isEnable = true;

        this.socket.on("updateInfoCharacter", (data) => {
            console.log("recieve update info")
            if (!this.game.verifyGameState(GameState.INIT)) {
                console.log("apply update info");
                let json = JSON.parse(data);
                    this.game.gameSocket.updateInfoCharacter(json.playerId,json.variable, json.value);
            }
            else {
                console.log("Cannot change characters info if the game hasn't started.");
            }
        })

        this.socket.on("updateInfoNpc", (data) => {
            console.log("update npc info " + data);
            if (!this.game.verifyGameState(GameState.INIT)) {
                let json = JSON.parse(data);
                this.game.gameSocket.updateInfoNpc(json.pawnCode, json.variable, json.value);
            }
            else{
                console.log("Cannot change npc info is the game hasn't started.");
            }
        })

        this.socket.on("switchState", (data) => {
            switch (data) {
                case "FREE":
                    this.game.updateGameState(GameState.FREE);
                    console.log("GameState is now "+this.game.gameState);
                    this.game.tableSocket?.socket?.emit("switchState", "FREE");
                    break;
                case "RESTRICTED":
                    this.game.updateGameState(GameState.RESTRICTED);
                    this.game.tableSocket?.socket?.emit("switchState", "RESTRICTED");
                    console.log("GameState is now "+this.game.gameState);

                    break;
                case "INIT_TURN_ORDER":
                    this.game.updateGameState(GameState.INIT_TURN_ORDER);
                    this.game.tableSocket?.socket.emit("switchState", "INIT_TURN_ORDER");
                    this.game.turnOrder.initOrder();
                    break;
                default:
                    console.log(`State ${data} not recognized.`);
            }
            this.game.logger.log("Images/information", "Game State", `GameState is now ${GameState[this.game.gameState]}`)
                .sendToEveryone();
        })

        this.socket.on("playerMove", (data) => {
            console.log("Send to table move");

            this.game.tableSocket?.socket.emit("playerMove", data);

        })

        this.socket.on("newNpc", (data) => {
            let json = JSON.parse(data);
            let id = Number(json.id);
            let name = json.name;
            let npc = this.game.npc.find(char => char.id === id);

            if (npc !== undefined) {
                let newNpc = new Npc(npc.id, name, npc.lifeMax, npc.life,npc.description, npc.image, npc.skills);
                this.game.newNpc = newNpc;

                console.log(`Adding new npc ${newNpc.id} ${newNpc.name}`);

                if (this.game.tableSocket.isEnable){
                    let newNpcString = JSON.stringify(this.game.newNpc);
                    this.game.tableSocket.socket.emit("newNpc", newNpcString);
                }
            }
            else {
                console.error(`No npc of id ${id} exists.`);
            }
        });

        this.socket.on("nextTurn", () => {
            if (this.game.gameState === GameState.TURN_ORDER)
            {
                this.game.turnOrder.next();
            }
        });

        this.socket.on("dice", (data) => {
            let json = JSON.parse(data);

            if (json.playerId !== undefined && json.diceId !== undefined && json.value !== undefined) {
                this.game.diceManager.checkDiceValue(json.playerId, json.diceId, json.value);
            }
            else {
                console.log("Dice info not correct : "+ data);
            }
        });

        this.socket.on("attackNpc", (data) => {
            let json = JSON.parse(data);

            let npcPawnCode = json.launchId;
            let targetId = json.targetId;
            let targetIsNpc = json.targetIsNpc;
            let skill = new Skill(json.skill.id, json.skill.name, json.skill.manaCost, json.skill.range, json.skill.maxTarget, json.skill.type, json.skill.statModifier, json.skill.healing, json.skill.image);
            // aplly the effects
            var modifiedLife = this.game.gameSocket.applySkillNpc(targetId, targetIsNpc, skill);

            // send changement
            if (targetIsNpc){
                console.log(`Npc ${npcPawnCode} attack npc ${targetId} and set is life to ${modifiedLife}`)
                this.socket.emit("updateInfoNpc", {pawnCode:targetId, variable:"life", value:modifiedLife});
                this.game.tableSocket?.socket.emit("updateNpcInfo", {pawnCode:targetId, variable:"life", value:modifiedLife});

            }
            else{
                console.log(`Npc ${npcPawnCode} attack player ${targetId} and set is life to ${modifiedLife}`)
                this.socket.emit("updateInfoCharacter", {playerId:targetId, variable:"life", value:modifiedLife});
                this.game.tableSocket?.socket.emit("updateInfoCharacter", {playerId:targetId, variable:"life", value:modifiedLife});
                this.game.gameSocket.findPlayerSocket(targetId)?.socket.emit("updateInfoCharacter", {variable:"life", value:modifiedLife});
            }
        })
    }
}
