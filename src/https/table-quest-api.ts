import { Express } from 'express'
import Game from '../models/game';

import data from '../../data/game.json'
import {Log} from "../models/logger";


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
                .send(JSON.stringify({ "characters": data.characters }))
        });

        this.app.get('/npcs', (req, res) => {
            console.log("npcs");
            res.status(200)
                .send(JSON.stringify({"npcList":data.npc}))
        });

        this.app.get('/inGameNpcs', (req, res) => {
            let npcObj = {"npcList": this.game.npcTable};
            res.status(200)
                .send(JSON.stringify(npcObj))
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
                    characterList.push({"playerId": p.player.id ,"characterInfo":p.player.character});
                }
            })
            let charactersObj = {"characterList": characterList};
            res.status(200)
                .send(JSON.stringify(charactersObj));
        });

        this.app.get('/players/:playerId/characterInfo', (req, res) => {
            if (this.game.isPlayerExist(req.params.playerId)) {
                let playerChar = this.game.getPlayer(req.params.playerId)!.character;
                if (!(playerChar == null)) {
                    res.status(200)
                        .send(JSON.stringify({
                            "id": playerChar.id,
                            "life": playerChar.life,
                            "mana": playerChar.mana
                        }));
                }
                else {
                    res.sendStatus(204);
                }
            }
        })

        this.app.get('/players/:playerId/skills', (req, res) => {
            if (this.game.isPlayerExist(req.params.playerId)) {
                let playerChar = this.game.getPlayer(req.params.playerId)!.character;
                res.status(200)
                    .send(JSON.stringify(playerChar.skills));
            }
        });

        this.app.get('/logs', (req, res) =>{
            let logs: Log[] = this.game.logger.logs;
            let logList = new Array<Object>;

            for (const log of logs) {
                logList.push({
                    "imagePath": log.imagePath,
                    "title": log.title,
                    "logText": log.logText
                });
            }
            res.status(200).send(JSON.stringify({"listOfLogs": logList}));
        })

        this.app.get('/mjLogs', (req, res) =>{
            let mjLogs: Log[] = this.game.logger.mjLogs;
            let logList = new Array<Object>;

            for (const log of mjLogs) {
                logList.push({
                    "imagePath": log.imagePath,
                    "title": log.title,
                    "logText": log.logText
                });
            }

            res.status(200).send(JSON.stringify({"listOfLogs": logList}));
        })
    }
}
