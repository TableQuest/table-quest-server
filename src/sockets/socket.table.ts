import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { idText } from "typescript";
import Game from "../models/game";


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
            console.log(`Player ${json.playerId} clicked skill ${json.skillName} (${json.skillId})`);

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
        })

        /*
        When a player did all the steps to use a skill on the table, it sends a message to the server with the player ID,
        the skill ID and the target ID. The task is given to the gameSocket which will do all the verifications, will
        trigger or not the skill and will emit the messages accordingly.

         Json must contain a playerId as a string, a skillId as an int, and a targetId as a string.
         */
        this.socket.on("useSkill", (data) => {
            let json = JSON.parse(data);
            console.log(`Received "useSkill" with ${json.playerId}, ${json.skillId}, ${json.targetId}.`)
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
            console.log("Movement of player id : " + data);
            this.socket.emit("playerMove", JSON.stringify({"playerId": data, "speed": 2}));
        })

        this.socket.on("newNpc", (data) => {
            if (this.game.newNpc !== undefined){
                this.game.newNpc.pawnCode = data;

                console.log(`Associate ${this.game.newNpc.name} ${this.game.newNpc.id} with the tabgible ${this.game.newNpc.pawnCode}`);
                
                if (this.game.mjSocket.isEnable){
                    this.game.mjSocket.socket.emit("newNpc", this.game.newNpc)
                }
                this.game.npcTable.push(this.game.newNpc);
                this.game.newNpc = undefined;

            }
        })
    }
}
