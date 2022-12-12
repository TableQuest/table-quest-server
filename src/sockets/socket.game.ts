import { json } from "stream/consumers";
import Game from "../models/game";
import Player from "../models/player";

export default class GameSocket{

    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    /**
     * When the mj remove life from the character:
     *  - update the character on the model
     *  - emit the change to the mj
     *  - emit the change to the player connected to the character
     */
    public updatePlayerLife(id:string, life:number){
        let playerSocket = this.game.playerSockets.find(p => p.player.id === id);
        playerSocket!.player.character.life = life;
        console.log("Player "+playerSocket!.player.character.name+" has "+playerSocket!.player.character.life+" points of life");
        // send to the mj
        this.game.mjSocket.socket.emit("updateLifeCharacter",{ id:id, life:life});

        // send to the player connected to the character
        playerSocket?.socket.emit("updateLifePlayer", ""+life);

        // send to the table
        //this.game.tableSocket.socket.emit("updateLifeCharacter",{id:id, life:life});
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
