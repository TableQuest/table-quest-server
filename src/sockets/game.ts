import { Server } from "socket.io";
import { App } from "../server";

export default class GameSocket {
    
    io: Server;
    app: App;
    
    constructor(app: App, io: Server) {
        this.io = io;
        this.app = app;

        this.defineSockets();
    }
    
    defineSockets() {
        throw new Error("Method not implemented.");
    }
}