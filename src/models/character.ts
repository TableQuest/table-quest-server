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
    setLifeMax(lifeMax: number){
        this.lifeMax = lifeMax;
    }

    
    setMana(mana: number){
        this.mana = mana;
    }
    setManaMax(manaMax: number){
        this.manaMax = manaMax;
    }

    getSkill(skillId: number) {
        return this.skills.find(s => s.id == skillId);
    }

    public updateInfo(variable: string, value: string): void {
        switch (variable) {
            case "life":
                try {
                    this.life = Number(value);
                } catch (error) {
                    console.log("Life value not numerical")
                }
                break;
            case "lifeMax":
                try {
                    this.lifeMax = Number(value);
                } catch (error) {
                    console.log("LifeMax value not numerical")
                }
                break;
            case "mana":
                try {
                    this.mana = Number(value);
                } catch (error) {
                    console.log("Mana value not numerical")
                }
                break;
            case "manaMax":
                try {
                    this.manaMax = Number(value);
                } catch (error) {
                    console.log("ManaMax value not numerical")
                }
                break;                   
            default:
                break;
        }
    }

}
