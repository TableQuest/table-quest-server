import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";

export default class GameSocket{
    
    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    public updatePlayerLife(id:number, life:number){
        let playerSocket = this.game.playerSockets.find(p => p.player.character.id === id);
        playerSocket!.player.character.life = life;
        console.log("New player life");
        console.log(playerSocket!.player.character.life);
        //this.game.mjSocket.socket.emit("updateLifePlayer",{ id:id, life:life});
        playerSocket?.socket.emit("updateLifePlayer", ""+life); 
    }
}