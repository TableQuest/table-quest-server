import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import PlayerSocket from "../sockets/socket.player";
import Character from "./character";

export default class Player {

    id: string;
    character: Character;
    pawnCode: string;
    menuCode: string;

    constructor(id: string, pawnCode: string, menuCode: string) {
        this.id = id;
        this.pawnCode = pawnCode;
        this.menuCode = menuCode;
    }
}