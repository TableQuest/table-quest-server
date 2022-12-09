import { Server, Socket } from "socket.io";
import Game from "../models/game";
import MJ from "../models/mj";


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

        /**
         * When the mj remove life from the character: 
         *  - update the character on the model 
         *  - emit the change to the mj
         *  - emit the change to the player connected to the character
         */
        this.socket.on("updateLifeCharacter", (data) =>{
            let json = JSON.parse(data);
            this.game.gameSocket.updatePlayerLife(json.id, json.life);

        })

        this.socket.on("switchStatePlaying", () => {
            this.game.tableSocket.socket.emit("switchStatePlaying", "");
        })
    }
}