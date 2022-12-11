import { Server } from "socket.io";
import Game from "../models/game";
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
      console.log("user connected");

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
        let json = JSON.parse(JSON.stringify(msg));
        
        if (json.menuCode !== undefined && json.pawnCode !== undefined) {

          let playerId = json.menuCode+json.pawnCode

          if (!this.game.isPlayerExist(playerId)) {
            let playerSocket = new PlayerSocket(
              this.game,
              playerId,
              json.pawnCode,
              json.menuCode,
              this.io
            );

            playerSocket.initWebSocket(socket);
            this.game.addPlayer(playerSocket);

            console.log(`Successfully added the player ${playerSocket.player.id} with the socket ${socket.id}`);
          }
          else {
            console.log(`The player ${playerId} already exists, updated the socket ${socket.id} successfully.`);
            this.game.updatePlayerSocket(socket, playerId)
          }

          //this.game.tableSocket.socket.emit("playerConnection", playerId);

        } else {
          console.error("Bad Request json not correct, please give a valid json (menuCode) + (pawnCode) "+ json);
        }
      });
    });
  }
}