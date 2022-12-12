import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";

export default class GameSocket{

    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    public updatePlayerLife(id:number, life:number){
        let playerSocket = this.game.playerSockets.find(p => p.player.id === id);
        playerSocket!.player.character.life = life;
        console.log(`Player ${playerSocket!.player.id}'s life: ${playerSocket!.player.character.life}`);
        playerSocket?.socket.emit("updateLifePlayer", ""+life);
    }
    //
    // useSkill(playerId: string, skillId: number, targetId: string) {
    //     let playerSocket = this.findPlayerSocket(playerId);
    // }
    //
    // findPlayerSocket(id: string) {
    //     return this.game.playerSockets.find(p => p.player.id === id);
    // }
}
