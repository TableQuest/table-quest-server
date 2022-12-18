import {Server, Socket} from "socket.io";
import Game, {GameState} from "../models/game";
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

        this.socket.on("switchState", (data) => {
            switch (data) {
                case "PLAYING":
                    this.game.updateGameState(GameState.PLAYING);
                    //this.game.tableSocket.socket.emit("switchStatePlaying", "");
                    break;
                case "RESTRICTED":
                    this.game.updateGameState(GameState.RESTRICTED);
                    this.game.tableSocket.socket.emit("switchStateRestricted", ""); //doesn't exist yet on table client-side, but it's here as an example
                    break;
                default:
                    console.log(`State ${data} not recognized.`);
            }
            console.log(`GameState is now ${GameState[this.game.gameState]}`);
        })
    }
}
