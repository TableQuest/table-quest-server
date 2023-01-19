import Character from "./character";

export default class Player {

    character: Character;
    menuCode: string;
    pawnCode: string;
    id: string;

    constructor(id: string, pawnCode: string, menuCode: string) {
        this.pawnCode = pawnCode;
        this.menuCode = menuCode;
        this.id = id;
    }

    setPawnCode() {
        this.character.pawncode = this.pawnCode;
    }
}
