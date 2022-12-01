import MJ from "./mj";
import Player from "./player";
import Table from "./table";

import gameJson from '../../data/game.json';
import Character from "./character";

export default class Game {

    characters: Character[];
    players: Player[];
    mj: MJ;
    table: Table;

    constructor() {
        this.players = [];
        this.characters = this.createCharacters();
    }

    createCharacters(): Character[] {
        let characters = [];

        for (let i = 0; i < gameJson.characters.length; i++) {
            characters.push(
                new Character(
                    i,
                    gameJson.characters[i].name,
                    gameJson.characters[i].lifeMax,
                    gameJson.characters[i].life,
                    gameJson.characters[i].description
                )
            );
        }

        return characters;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    removePlayer(player: Player) {
        let i = this.players.indexOf(player);
        this.players.splice(i, 1);
    }

    addMJ(socket: any) {
        this.mj.socket = socket;
    }

    addTable(socket: any) {
        this.table.socket = socket;
    }


}