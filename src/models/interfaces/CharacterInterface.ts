import SkillInterface from "./SkillInterface";


export default interface CharacterInterface {
    id: number;
    name: string;
    lifeMax: number;
    life: number;
    manaMax: number;
    mana: number;
    description: string;
    speed: number
    skills: SkillInterface[];

    setLife(life: number):void;
    setMana(mana: number):void;

    hasEnoughMana(skill: SkillInterface): boolean;
    getSkill(skillId: number): SkillInterface | undefined;
}
