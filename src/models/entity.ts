import EntityInterface from "./interfaces/EntityInterface";

export default class Entity implements EntityInterface {

    pawncode: string;
    id: number;
    name: string;
    life: number;
    lifeMax: number;
    description: string;
    image: string;

    constructor(id: number, name: string, life: number, lifeMax: number, description: string, image:string) {
        this.description = description;
        this.id = id;
        this.life = life;
        this.lifeMax = lifeMax;
        this.name = name;
        this.image = image;
        this.pawncode = "";
    }

    setLife(life: number){
        this.life = Math.max(Math.min(life, this.lifeMax), 0);
    }

    setLifeMax(lifeMax: number){
        this.lifeMax = lifeMax;
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
            default:
                break;
        }
    }

}
