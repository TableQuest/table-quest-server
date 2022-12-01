import Character from "./character";

export default class Player {

    socket: any;
    id: number;
    charcater: Character;
    pawnCode: string;
    menuCode: string;

    constructor(id: number, socket: any, pawnCode: string, menuCode: string) {
        this.id = id;
        this.socket = socket;
        this.pawnCode = pawnCode;
        this.menuCode = menuCode;
    }
}