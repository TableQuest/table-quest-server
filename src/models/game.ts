import MJSocket from "../sockets/socket.mj";
import PlayerSocket from "../sockets/socket.player";
import ConnectionSocket from "../sockets/socket.connection";
import { App } from "../server";
import { Server, Socket } from "socket.io";
import TableQuestAPI from "../https/table-quest-api";
import { Express } from 'express'
import TableSocket from "../sockets/socket.table";

import gameJson from '../../data/game.json';
import CharacterInterface from "./interfaces/CharacterInterface";

/**
 * Main Controller of the Server. Contains the models and the devices` sockets.
 */
export default class Game {    
    app: App;

    /* Static models of the differents characters. */
    characters: Array<CharacterInterface>;

    /* All the sockets of the system. */
    mjSocket: MJSocket
    playerSockets: PlayerSocket[];
    connectionSocket: ConnectionSocket;
    tableSocket: TableSocket;

    /* REST API of the System. */
    api : TableQuestAPI;

    constructor(app: App, io: Server, express: Express) {
        this.app = app;

        /* Static Game Assets */
        this.characters = gameJson.characters as Array<CharacterInterface>;

        /* Sockets */
        this.mjSocket = new MJSocket(this, io);
        this.playerSockets = [];
        this.connectionSocket = new ConnectionSocket(this, io);
        this.tableSocket = new TableSocket(this, io);

        /* API */
        this.api = new TableQuestAPI(this, express);
    }

    addPlayer(player: PlayerSocket) {
        this.playerSockets.push(player);
    }

    removePlayer(player: PlayerSocket) {
        let i = this.playerSockets.indexOf(player);
        this.playerSockets.splice(i, 1);
    }

    addMJ(socket: any) {
        this.mjSocket.initWebSocket(socket);
    }

    addTable(socket: any) {
        this.tableSocket.initWebSocket(socket);
    }

    isPlayerExist(playerId: any) {
        let playerExists = false;

        this.playerSockets.forEach(playerSocket => {
            if (playerSocket.player.id === playerId) {
                playerExists = true;
            }
        });

        return playerExists;
    }

    updatePlayerSocket(socket: Socket, playerId: any) {
        this.playerSockets.forEach(playerSocket => {
            if (playerSocket.player.id === playerId) {
                playerSocket.initWebSocket(socket);
                return;
            }
        })
    }
}