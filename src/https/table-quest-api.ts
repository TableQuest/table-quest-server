import { Express } from 'express'
import { App } from '../server';

export default class TableQuestAPI {

    app: Express;
    tableQuest: App;

    constructor(tableQuest: App ,app: Express) {
        this.tableQuest = tableQuest
        this.app = app;
        this.defineRouting();
    }

    defineRouting() {
        this.app.get('/', (req, res) => {
            res.status(200).send("Server TableQuest is on")
        });

        this.app.get('/characters', (req, res) => {
            res.status(200)
                .send(JSON.stringify(this.tableQuest.game.characters))
        });
        
    }   
}