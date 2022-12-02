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
    }
}