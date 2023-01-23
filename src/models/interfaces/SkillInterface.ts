import Character from "../character";

export default interface SkillInterface {
    id: number;
    name: string;
    manaCost: number;
    range: number;
    maxTarget: number;
    type: string;
    statModifier: number;
    healing: boolean;
    image: string;
    condition: number;

    applyEffect(target: Character): void;
}
