import { Server } from "socket.io";
import Player from "../models/player";
import { App } from "../server";

export default class ConnectionSocket {

    io: Server;
    app: App;
    
    constructor(app: App, io: Server) {
        this.io = io;
        this.app = app;

        this.defineSockets();
    }

    defineSockets() {
        this.io.on('connection', (socket) => {

            console.log("user connected");
          
            socket.on('hello', (msg) => {
              console.log("user send hi" + msg);
              this.io.emit('world', msg)
            });

            socket.on('mjConnection', () => {
              console.log("MJ connected");
              this.app.game.addMJ(socket);
            });
            
            socket.on('tableConnected', () => {
              console.log("Table connected");
              this.app.game.addTable(socket)
            });

            socket.on('mobileConnection', (json) => {
              if (json.menuCode !== undefined && json.pawnCode !== undefined) {
                let player = new Player(
                  json.menuCode+json.pawnCode,
                  socket,
                  json.pawnCode,
                  json.menuCode
                );
                this.app.game.addPlayer(player);
                console.log(`Successfully added the player ${player.id} with the socket ${socket.id}`);
              }
              else {
                console.error("Bad Request json not correct, please give a valid json (menuCode) + (pawnCode)");
              }
            });
        });
    }
}