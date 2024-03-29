import {Server, Socket} from "socket.io";
import Game, {GameState} from "../models/game";


/**
 * Handle events coming from the table device.
 */
export default class TableSocket {

    io: Server;
    game: Game;
    isEnable: boolean;
    socket: Socket;

    constructor(game: Game, io: Server) {
        this.game = game;
        this.io = io;
        this.isEnable = false;
    }

    initWebSocket(socket: Socket) {
        this.socket = socket;
        this.isEnable = true;

        this.socket.on("clickSkill", (data) => {
            let json = JSON.parse(data);
            if (this.game.turnOrder.isPlayerTurn(json.playerId)) {
                let player = this.game.getPlayer(json.playerId);
                let skill = player.character.getSkill(json.skillId);
                let targetIdList: string[] = [];
                this.game.playerSockets.forEach(playerSocket => {
                    targetIdList.push(playerSocket.player.id);
                });

                let myData: any = {
                    playerId: player.id,
                    skill: skill,
                    targetsId: targetIdList
                }
                let responseJson = JSON.stringify(myData);
                console.log(responseJson);
                this.socket.emit("clickSkill", responseJson);
            }
            else {
                console.log("But it is not his turn to play !");
            }
        })

        /*
        When a player did all the steps to use a skill on the table, it sends a message to the server with the player ID,
        the skill ID and the target ID. The task is given to the gameSocket which will do all the verifications, will
        trigger or not the skill and will emit the messages accordingly.

         Json must contain a playerId as a string, a skillId as an int, and a targetId as a string.
         */
        this.socket.on("useSkill", (data) => {
            let json = JSON.parse(data);
            this.game.gameSocket.tryUsingSkill(json.playerId, json.skillId, json.targetId);
        })

        this.socket.on("attackPlayer", (data) =>{
            let json = JSON.parse(data);
            console.log(json);
            this.game.gameSocket.updateInfoCharacter(json.id,"life",json.life);
        });

        this.socket.on("debugMessage", (data) =>{
            console.log(data);
        });

        this.socket.on("playerMove", (data) => {
            if (this.game.turnOrder.isPlayerTurn(data)) {
                console.log("Movement of player id : " + data);
                this.socket.emit("playerMove", JSON.stringify({"playerId": data, "speed": 2}));
            }
            else {
                console.log(`Player ${data} can't move !`)
            }
        });

        this.socket.on("newNpc", (data) => {
            if (this.game.newNpc !== undefined){
                this.game.newNpc.pawncode = data;
                this.game.gameSocket.updateInfoNpc(data, "lifeMax", this.game.newNpc.lifeMax.toString());
                this.game.tableSocket?.socket?.emit("updateInfoNpc", { "playerId":data, "variable":"lifeMax", "value":this.game.newNpc.lifeMax.toString()});
                this.game.tableSocket?.socket?.emit("updateInfoNpc", { "playerId":data, "variable":"life", "value":this.game.newNpc.life.toString()});

                console.log(`Associate ${this.game.newNpc.name} ${this.game.newNpc.id} with the tabgible ${this.game.newNpc.pawncode}`);
                
                if (this.game.mjSocket.isEnable){
                    this.game.mjSocket.socket.emit("newNpc", this.game.newNpc.pawncode)
                    console.log("send newNpc to mj");
                }
                this.game.npcTable.push(this.game.newNpc);
                console.log(this.game.npcTable);
                this.game.newNpc = undefined;
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

        this.socket.on("skillDice", (data) => {
           let json = JSON.parse(data);

           if (json.playerId !== undefined && json.diceId !== undefined && json.value !== undefined && json.targetValue !== undefined) {
               if(this.game.gameSocket.pendingSkill !== undefined
                   && ((this.game.gameState == GameState.TURN_ORDER && this.game.turnOrder.getCurrentEntity().pawncode === json.playerId)
                       || this.game.gameState != GameState.TURN_ORDER)) {

                   let entity = this.game.getEntity(json.playerId);
                   console.log("Using skill apply !")
                   if (json.value >= json.targetValue) {
                       console.log("Player had success on his dice roll !");
                       this.game.logger.log(
                           entity!.image,
                           json.playerId,
                           `Roll a D20 dice and did ${json.value}, success !`
                       ).sendToEveryone();
                       this.game.gameSocket.pendingSkill.apply();
                   }
                   else {
                       this.game.logger.log(
                           entity!.image,
                           json.playerId,
                           `Roll a D20 dice and did ${json.value}, failure...`
                       ).sendToEveryone();
                   }
               }
               this.game.gameSocket.pendingSkill = undefined;
           }
        });

        this.socket.on("cancelPendingSkill", () => {
            console.log("Pending Skill has been canceled.")
            this.game.gameSocket.pendingSkill = undefined;
        });
    }
}
