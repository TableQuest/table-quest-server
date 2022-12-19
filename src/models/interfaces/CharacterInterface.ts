import SkillInterface from "./SkillInterface";
import EntityInterface from "./EntityInterface";


export default interface CharacterInterface extends EntityInterface {
    manaMax: number;
    mana: number;
    speed: number;
    skills: SkillInterface[];

    setMana(mana: number):void;
    setManaMax(manaMax: number):void;

    hasEnoughMana(skill: SkillInterface): boolean;
    getSkill(skillId: number): SkillInterface | undefined;

}
