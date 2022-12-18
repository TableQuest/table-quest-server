import CharacterInterface from "./interfaces/CharacterInterface";
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
        this.manaMax = manaMax;
        this.mana = mana;
        this.description = description;
        this.skills = skills;
    }

    hasEnoughMana(skill: SkillInterface) {
        return skill!.manaCost <= this.mana;
    }

    setLife(life: number){
        this.life = Math.max(Math.min(this.life, this.lifeMax), 0);
    }

    setMana(mana: number){
        this.mana = Math.max(Math.min(this.mana, this.manaMax), 0);
    }

    getSkill(skillId: number) {
        return this.skills.find(s => s.id == skillId);
    }
}
