import Game from "./game";
import {Socket} from "socket.io";

export default class Logger {
    game: Game;
    logs: Log[];

    constructor(game: Game) {
        this.logs = [];
        this.game = game;
    }

    log(imagePath: string, title: string, logText: string) : Log
    {
        let log = new Log(imagePath, title, logText, this.game);
        if (this.logs.length >= 20)
        {
            this.logs.splice(0,1);
        }
        this.logs.push(log);
        return log;
    }
}

export class Log {
    game: Game;

    imagePath: string;
    title: string;
    logText: string;


    constructor(imagePath: string, title: string, logText: string, game: Game) {
        this.game = game;
        this.imagePath = imagePath;
        this.title = title;
        this.logText = logText;
    }

    sendToEveryone()
    {
        for (const playerSocket of this.game.playerSockets) {
            playerSocket.socket.emit("log", JSON.stringify({
                "imagePath": this.imagePath,
                "title": this.title,
                "logText": this.logText
            }));
        }
        this.game.mjSocket.socket.emit("log", JSON.stringify({
            "imagePath": this.imagePath,
            "title": this.title,
            "logText": this.logText
        }));
    }

    sendTo(socket: Socket)
    {
        socket.emit("log", JSON.stringify({
            "imagePath": this.imagePath,
            "title": this.title,
            "logText": this.logText
        }));
    }
}
