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

        // The mj change the life of a character
        this.socket.on("updateLifeCharacter", (data) =>{
            let json = JSON.parse(data);
            this.game.gameSocket.updatePlayerLife(json.id, json.life);
            this.socket.emit("updateLifeCharacter", )
        })

        this.socket.on("switchStatePlaying", () => {
            this.game.tableSocket.socket.emit("switchStatePlaying", "");
        })

        this.socket.on("switchStateConstraint", () => {
            this.game.tableSocket.socket.emit("switchStateConstraint", "");
        })
        
        this.socket.on("playerMove", (data) => {
            console.log("Send to table move");
            
            this.game.tableSocket.socket.emit("playerMove", data);

        })
    }
}