import CharacterInterface from "./interfaces/CharacterInterface";

export default class Character implements CharacterInterface{

    id: number;
    name: string;
    lifeMax: number;
    life: number;
    description: string;
    speed: number;

    constructor(id: number, name: string, lifeMax: number, life: number, description: string, speed: number) {
        this.id = id;
        this.name = name;
        this.lifeMax = lifeMax;
        this.life = life;
        this.description = description;
        this.speed = speed;
    }

    setLife(life: number){
        this.life = life;
    }
}