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
    }
}