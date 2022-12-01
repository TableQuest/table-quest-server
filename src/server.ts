import http from 'http'
import {Server} from 'socket.io'
import express, { Express } from 'express'
import TableQuestAPI from './https/table-quest-api'
import ConnectionSocket from './sockets/connection'
import Game from './models/game'

const port: number = 3000

export class App {
    private server: http.Server;
    private port: number;
    
    app: Express;
    io: Server;

    game: Game;

    api: TableQuestAPI;
    
    connectionSocket: ConnectionSocket;

    constructor(port: number) {
        this.port = port;

        this.app = express();

        this.server = http.createServer(this.app);
        this.io = new Server(this.server);

        this.game = new Game();
        
        this.api = new TableQuestAPI(this, this.app);
        this.connectionSocket = new ConnectionSocket(this, this.io);
    }

    public Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
        })
    }
}

new App(port).Start()