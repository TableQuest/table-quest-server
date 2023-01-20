import SkillInterface from "./interfaces/SkillInterface";
import Character from "./character";

export default class Skill implements SkillInterface {
    id: number;
    name: string;
    manaCost: number;
    range: number;
    maxTarget: number;
    type: string;
    statModifier: number;
    healing: boolean;
    image: string;

    constructor(id: number, name: string, manaCost: number, range: number, maxTarget: number, type: string, statModifier: number, healing: bool, image: string) {
        this.id = id;
        this.name = name;
        this.manaCost = manaCost;
        this.range = range;
        this.maxTarget = maxTarget;
        this.type = type;
        this.statModifier = statModifier;
        this.healing = healing;
        this.image = image;
    }

    applyEffect(target: Character)
    {}
}
