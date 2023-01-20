import {Server} from "socket.io";
import Game, {GameState} from "../models/game";
import PlayerSocket from "./socket.player";

/**
 * Handle the connection between all devices and the server. Initialize the devices`socket.
 */
export default class ConnectionSocket {

  io: Server;
  game: Game;

  constructor(game: Game, io: Server) {
    this.io = io;
    this.game = game;

    this.defineSockets();
  }

  defineSockets() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      /**
       * Test for the server and the sockets.
       */
      socket.on('hello', (msg) => {
        console.log("user send hi" + msg);
        this.io.emit('world', msg)
      });

      /**
       * On connection of the mj, update the socket of the mj.
       */
      socket.on('mjConnection', () => {
        console.log("MJ connected");
        this.game.addMJ(socket);
      });

      /**
       * On Connection of the table update the socket of the table.
       */
      socket.on('tableConnection', () => {
        console.log("Table connected");
        this.game.addTable(socket)
      });

      /**
       * On Mobile detection provide the code of the Menu + the code of the Pawn
       */
      socket.on('playerConnection', (msg) => {
        console.log(msg)
        let json = JSON.parse(msg);
        if (json.menuCode !== undefined && json.pawnCode !== undefined) {

          let playerId = json.menuCode+json.pawnCode

          if (!this.game.isPlayerExist(playerId) && this.game.gameState === GameState.INIT)
          {
            let playerSocket = new PlayerSocket(
              this.game,
              playerId,
              json.pawnCode,
              json.menuCode,
              this.io
            );

            playerSocket.initWebSocket(socket);
            this.game.addPlayer(playerSocket);
            this.game.tableSocket.socket.emit("playerConnection", playerId);

            console.log(`Successfully added the player ${playerSocket.player.id} with the socket ${socket.id}`);
          }

          else
          {
            this.game.updatePlayerSocket(socket, playerId);
            console.log(`The player ${playerId} already exists, updated its socket to ${socket.id} successfully.`);
            this.game.disconnectedPlayer.splice(this.game.disconnectedPlayer.indexOf(playerId), 1);
            console.log(`${this.game.disconnectedPlayer} players are still off.`);

            if (this.game.disconnectedPlayer.length === 0)
            {
              console.log('The game will be resumed.');
              this.game.updateGameState(this.game.previousGameState);
              this.game.tableSocket.socket.emit("resumeGame");
            }
            else
            {
              let listOfPlayerIdsAsString: string = this.game.getDisconnectedPlayerIdAsString();
              this.game.tableSocket.socket.emit("pauseGame", listOfPlayerIdsAsString);
            }
          }

        } else {
          console.error("Bad Request json not correct, please give a valid json (menuCode) + (pawnCode) "+ json);
        }
      });
    });
  }
}
