import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
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


        this.socket.on("attackPlayer", (data) =>{
            let json = JSON.parse(data);
            console.log(json);
            this.game.gameSocket.updatePlayerLife(json.id, json.life);
        });

        this.socket.on("debugMessage", (data) =>{
            console.log(data);
        });

        this.socket.on("playerMove", (data) => {
            console.log("Movement of player id : " + data);
            this.socket.emit("playerMove", JSON.stringify({"playerId": data, "speed": 2}));
        })
    }
}