import Entity from "./entity";
import SkillInterface from "./interfaces/SkillInterface";
export default class Npc extends Entity{

    pawnCode: string;

    constructor(id: number, name: string, lifeMax: number, life: number, description: string, image: string, skills: SkillInterface[]) {
        super(id, name, life, lifeMax, description, image, skills);
    }

}
