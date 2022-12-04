

export default interface CharacterInterface {
    id: number;
    name: string;
    lifeMax: number;
    life: number;
    description: string;

    setLife(life: number):void;
}