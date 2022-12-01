import { Server } from "socket.io";
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
            })
        });
    }
}