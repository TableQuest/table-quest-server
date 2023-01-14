import CharacterInterface from "./interfaces/CharacterInterface";
import SkillInterface from "./interfaces/SkillInterface";
import Entity from "./entity";

export default class Character extends Entity implements CharacterInterface{

    manaMax: number;
    mana: number;
    speed: number;
    skills: SkillInterface[];

    constructor(id: number, name: string, lifeMax: number, life: number,manaMax: number, mana: number, description: string, speed: number, skills: SkillInterface[]) {
        super(id, name, life, lifeMax, description);
        this.manaMax = manaMax;
        this.mana = mana;
        this.speed = speed;
        this.skills = skills;
    }

    hasEnoughMana(skill: SkillInterface) {
        return skill!.manaCost <= this.mana;
    }

    setMana(mana: number){
        this.mana = Math.max(Math.min(mana, this.manaMax), 0);
    }
    setManaMax(manaMax: number){
        this.manaMax = manaMax;
    }

    getSkill(skillId: number) {
        return this.skills.find(s => s.id == skillId);
    }

    public override updateInfo(variable: string, value: string): void {
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
            case "speed":
                try {
                    this.speed = Number(value);
                } catch (error) {
                    console.log("Speed value not numerical")
                }
                break;
            default:
                break;
        }
    }

}
