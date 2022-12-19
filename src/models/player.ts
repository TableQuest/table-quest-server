import Character from "./character";
import Tangible from "./tangible";

export default class Player extends Tangible {

    override character: Character;
    menuCode: string;

    constructor(id: string, pawnCode: string, menuCode: string) {
        super(id, pawnCode);
        this.menuCode = menuCode;
    }
}
