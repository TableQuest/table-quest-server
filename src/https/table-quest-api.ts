import { Express } from 'express'
import Game from '../models/game';

import characters from '../../data/game.json'
import Player from '../models/player'
import Character from '../models/character'


export default class TableQuestAPI {

    app: Express;
    game: Game;

    constructor(game: Game ,app: Express) {
        this.game = game;
        this.app = app;
        this.defineRouting();
    }

    defineRouting() {
        this.app.get('/', (req, res) => {
            res.status(200).send("Server TableQuest is on")
        });

        this.app.get('/characters', (req, res) => {
            res.status(200)
                .send(JSON.stringify(characters))
        });

        this.app.get('/characters/:id', (req, res) => {
            let id = +req.params.id;
            let character = this.game.characters.find(c => c.id === id);
            res.status(200)
                .send(JSON.stringify(character));
        });

        this.app.get('/inGameCharacters', (req, res) => {
            let characterList =new Array<Object>;
            this.game.playerSockets.forEach(function(p){
                if (p.player.character != null){
                    let cObj = JSON.stringify(p.player.character);

                    characterList.push({"playerId": p.player.id ,"characterInfo":p.player.character});
                }
            })
            let charactersObj = {"characterList": characterList};
            res.status(200)
                .send(JSON.stringify(charactersObj));
        })

        this.app.get('/players/:playerId/skills', (req, res) => {
            if (this.game.isPlayerExist(req.params.playerId)) {
                let playerChar = this.game.getPlayer(req.params.playerId)!.character;
                res.status(200)
                    .send(JSON.stringify(playerChar.skills));
            }
        })
    }
}
