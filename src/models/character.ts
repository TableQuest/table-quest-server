import CharacterInterface from "./interfaces/CharacterInterface";
import Skill from "./skill";
import SkillInterface from "./interfaces/SkillInterface";

export default class Character implements CharacterInterface{

    id: number;
    name: string;
    lifeMax: number;
    life: number;
    manaMax: number;
    mana: number;
    description: string;
    skills: SkillInterface[];

    constructor(id: number, name: string, lifeMax: number, life: number,manaMax: number, mana: number, description: string, skills: SkillInterface[]) {
        this.id = id;
        this.name = name;
        this.lifeMax = lifeMax;
        this.life = life;
        this.description = description;
        this.skills = skills;
    }

    isSkillUsable(skillId: number) {
        let skill = this.getSkill(skillId);
        return skill!.manaCost <= this.mana;
    }

    setLife(life: number){
        this.life = life;
    }

    setMana(mana: number){
        this.mana = mana;
    }

    getSkill(skillId: number) {
        return this.skills.find(s => s.id == skillId);
    }
}
