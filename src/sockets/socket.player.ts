import { Server, Socket } from "socket.io";
import Game from "../models/game";
import Player from "../models/player";


/**
 * Handle events coming from the players`device.
 */
export default class PlayerSocket {

    game: Game;

    player: Player;
    socket: Socket;
    io: Server;
    isEnable: boolean;

    constructor(game: Game, id: number, pawnCode: string, menuCode: string, io: Server) {
        this.game = game;
        this.io = io;
        this.isEnable = false;
        this.player = new Player(id, pawnCode, menuCode);
    }

    
    initWebSocket(socket: Socket) {
        this.socket = socket;
        this.isEnable = true;

        /**
         * When the player choose a character : update the character on the model and emits to the listeners the change.
         */
        this.socket.on("characterSelection", (idString) => {
            let id = +idString;
            let character = this.game.characters.find(char => char.id === id); 
            /**
             * Verification of the character ID.
             */
            if (character !== undefined) {
                this.player.charcater = character;
                console.log(`Update the character of the player ${this.player.id} with ${this.player.charcater.name} Successfully.`);
                
                /**
                 * Send request to the MJ only if he is connected to the server.
                 * Maybe define a callback on mj connection. Or avoid player selection on mj disconnection.
                 */
                if (this.game.mjSocket.isEnable) {
                    this.game.mjSocket.socket.emit("characterSelection", {
                        "player": this.player.id,
                        "characyer": JSON.stringify(this.player.charcater)
                    });
                }
            }
            else {
                console.error(`No characters of id ${id} exists.`);
            }
        });
    }
}