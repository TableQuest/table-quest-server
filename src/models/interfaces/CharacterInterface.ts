

export default interface CharacterInterface {
    id: number;
    name: string;
    lifeMax: number;
    life: number;
    description: string;
    speed: number

    setLife(life: number):void;
}