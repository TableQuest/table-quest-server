import Entity from "./entity";

export default class Tangible {
    id: string;
    character: Entity;
    pawncode: string;


    constructor(id: string, pawncode: string) {
        this.id = id;
        this.pawncode = pawncode;
    }
}
