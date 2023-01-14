import Entity from "./entity";
export default class Npc extends Entity{

    pawnCode: string;

    constructor(id: number, name: string, lifeMax: number, life: number, description: string) {
        super(id, name, life, lifeMax, description);
    }
}
