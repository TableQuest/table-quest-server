import { Express } from 'express'
import Game from '../models/game';

import characters from '../../data/game.json'

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

    }   
}