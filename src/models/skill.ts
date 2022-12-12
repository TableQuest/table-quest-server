import SkillInterface, {StatType} from "./interfaces/SkillInterface";
import Character from "./character";

export default class Skill implements SkillInterface {
    id: number;
    name: string;
    manaCost: number;
    range: number;
    maxTarget: number;
    type: string;
    statModifier: number;

    applyEffect(target: Character)
    {

    }
}
