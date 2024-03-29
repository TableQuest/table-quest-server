import {Server, Socket} from "socket.io";
import Game, {GameState} from "../models/game";
import Player from "../models/player";
import Character from "../models/character";


/**
 * Handle events coming from the players`device.
 */
export default class PlayerSocket {

    game: Game;

    player: Player;
    socket: Socket;
    io: Server;
    isEnable: boolean;

    constructor(game: Game, id: string, pawnCode: string, menuCode: string, io: Server) {
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
                this.player.character = new Character(character.id, character.name, character.lifeMax, character.life, character.manaMax, character.mana, character.description, character.speed, character.skills, character.image);
                this.player.setPawnCode();

                /**
                 * Send request to the MJ only if he is connected to the server.
                 * Maybe define a callback on mj connection. Or avoid player selection on mj disconnection.
                 */
                if (this.game.mjSocket.isEnable) {
                    this.game.mjSocket.socket.emit("characterSelection", {
                        "player": this.player.id,
                        "character": this.player.character
                    });

                    this.game.logger.log("Images/information",
                        "Character Selection",
                        `Update the character of the player ${this.player.id} with ${this.player.character.name} successfully.`)
                        .sendTo(this.game.mjSocket.socket);
                }
                this.game.tableSocket?.socket?.emit("characterSelection",{ playerId:this.player.id, character:this.player.character.name});
                this.game.tableSocket?.socket?.emit("updateInfoCharacter",{ playerId:this.player.id, variable:"life", value:character.life});
                this.game.tableSocket?.socket?.emit("updateInfoCharacter",{ playerId:this.player.id, variable:"lifeMax", value:character.lifeMax});
                this.game.tableSocket?.socket?.emit("updateInfoCharacter",{ playerId:this.player.id, variable:"mana", value:character.mana});
                this.game.tableSocket?.socket?.emit("updateInfoCharacter",{ playerId:this.player.id, variable:"manaMax", value:character.manaMax});
            }
            else {
                console.error(`No characters of id ${id} exists.`);
            }
        });

        this.socket.on("disconnect", (reason) =>
        {
            console.log(`Player's socket ${this.socket.id} disconnected with reason: ${reason}.`);
            this.game.pauseGame();
            this.game.disconnectedPlayer.push(this.player.id);

            let listOfPlayerIdsAsString: string = this.game.getDisconnectedPlayerIdAsString();
            this.game.tableSocket.socket.emit("pauseGame", listOfPlayerIdsAsString);
            console.log(`Waiting for players ${listOfPlayerIdsAsString}.`);
        });
    }
}
