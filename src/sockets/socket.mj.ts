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

        // The mj change the life of a character
        this.socket.on("updateLifeCharacter", (data) =>{

            if (!this.game.verifyGameState(GameState.INIT)) {
                let json = JSON.parse(data);
                this.game.gameSocket.updatePlayerLife(json.id, json.life);
            }
            else {
                console.log("Cannot change characters' life if the game hasn't started.");
            }
        })

        this.socket.on("switchState", (data) => {
            switch (data) {
                case "PLAYING":
                    this.game.updateGameState(GameState.PLAYING);
                    this.game.tableSocket.socket.emit("switchStatePlaying", "");
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

        this.socket.on("switchStateConstraint", () => {
            this.game.tableSocket.socket.emit("switchStateConstraint", "");
        })
        
        this.socket.on("playerMove", (data) => {
            console.log("Send to table move");
            
            this.game.tableSocket.socket.emit("playerMove", data);

        })
    }
}
