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
import GameSocket from "../sockets/socket.game";
import Character from "./character";
import EntityInterface from "./interfaces/EntityInterface";
import Entity from "./entity";
import Npc from "./npc";

export enum GameState {
    INIT,
    FREE,
    RESTRICTED,
}

/**
 * Main Controller of the Server. Contains the models and the devices` sockets.
 */
export default class Game {
    app: App;

    gameState: GameState;

    /* Static models of the different characters and npc. */
    characters: Array<CharacterInterface>;
    npc: Array<Npc>;
    newNpc: Npc | undefined;
    /* All the sockets of the system. */
    mjSocket: MJSocket
    playerSockets: PlayerSocket[];
    npcTable: Npc[];
    connectionSocket: ConnectionSocket;
    tableSocket: TableSocket;
    gameSocket: GameSocket;

    /* REST API of the System. */
    api : TableQuestAPI;

    constructor(app: App, io: Server, express: Express) {
        this.app = app;
        this.gameState = GameState.INIT;

        /* Static Game Assets */
        this.characters = [];
        for (let i=0; i<gameJson.characters.length; i++){
            let c = <Character>JSON.parse(JSON.stringify(gameJson.characters[i]))
            let objC :Character = new Character(c.id, c.name, c.lifeMax, c.life, c.manaMax, c.mana, c.description, c.speed, c.skills, c.image);
            this.characters.push(objC);
        }

        this.npc = [];
        for (let i=0; i<gameJson.npc.length; i++){
            let n = <Npc>JSON.parse(JSON.stringify(gameJson.npc[i]))
            let objN = new Npc(n.id, n.name, n.lifeMax, n.life, n.description, n.image);
            this.npc.push(objN);
        }

        this.newNpc = undefined;

        /* Sockets */
        this.mjSocket = new MJSocket(this, io);
        this.playerSockets = [];
        this.npcTable = [];
        this.connectionSocket = new ConnectionSocket(this, io);
        this.tableSocket = new TableSocket(this, io);
        this.gameSocket = new GameSocket(this);

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

    getPlayer(playerId : string) {
        return this.playerSockets.find(p => p.player.id === playerId)!.player;
    }

    addMJ(socket: any) {
        this.mjSocket.initWebSocket(socket);
    }

    addTable(socket: any) {
        this.tableSocket.initWebSocket(socket);
    }

    isPlayerExist(playerId: string) {
        let playerExists = false;

        this.playerSockets.forEach(playerSocket => {
            if (playerSocket.player.id === playerId) {
                playerExists = true;
            }
        });

        return playerExists;
    }

    isNpcExist(npcId: number) {
        return this.npc.find(n => n.id === npcId) != undefined;
    }

    updatePlayerSocket(socket: Socket, playerId: string) {
        this.playerSockets.forEach(playerSocket => {
            if (playerSocket.player.id === playerId) {
                playerSocket.initWebSocket(socket);
                return;
            }
        })
    }

    updateGameState(newState: GameState) {
        this.gameState = newState;
    }

    verifyGameState(requiredState: GameState) {
        return this.gameState === requiredState;
    }

}
