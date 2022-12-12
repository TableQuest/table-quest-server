import Character from "../character";

export enum StatType {
    "PHYSICAL",
    "MENTAL"
}

export default interface SkillInterface {
    id: number;
    name: string;
    manaCost: number;
    range: number;
    maxTarget: number;
    type: string;
    statModifier: number;

    applyEffect(target: Character): void;
}

/*
socket.on("useSkill", (data) => {

}
 */
