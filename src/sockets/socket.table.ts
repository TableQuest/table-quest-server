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

        /*
        When a player did all the steps to use a skill on the table, it sends a message to the server with the player ID,
        the skill ID and the target ID. Just like updatePlayerLife, the job is given to the gameSocket which will look
        up the player, to get the character and then the skill in order to get all the necessary info.
         */
        this.socket.on("useSkill", (data) => {
            let json = JSON.parse(data);
            let playerId = json.playerId;
            let skillId = json.skillId;
            let targetId = json.targetId;
            //this.game.gameSocket.useSkill(playerId, skillId, targetId);
        })
    }
}
