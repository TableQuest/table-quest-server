import { Server, Socket } from "socket.io";
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
            this.game.gameSocket.updatePlayerLife(json.id, json.life);
        })

        this.socket.on("debugMessage", (data) =>{
            console.log(data);
        })
    }
}
