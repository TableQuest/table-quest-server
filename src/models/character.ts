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
    speed: number;
    skills: SkillInterface[];

    constructor(id: number, name: string, lifeMax: number, life: number,manaMax: number, mana: number, description: string, speed: number, skills: SkillInterface[]) {
        this.id = id;
        this.name = name;
        this.lifeMax = lifeMax;
        this.life = life;
        this.manaMax = manaMax;
        this.mana = mana;
        this.description = description;
        this.speed = speed;
        this.skills = skills;
    }

    hasEnoughMana(skill: SkillInterface) {
        return skill!.manaCost <= this.mana;
    }

    setLife(life: number){
        this.life = Math.max(Math.min(this.life, this.lifeMax), 0);
    }
    setLifeMax(lifeMax: number){
        this.lifeMax = lifeMax;
    }

    
    setMana(mana: number){
        this.mana = Math.max(Math.min(this.mana, this.manaMax), 0);
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
