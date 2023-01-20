export default interface EntityInterface {
    id: number;
    name: string;
    lifeMax: number;
    life: number;
    description: string;
    image: string;

    setLife(life: number):void;
    setLifeMax(lifeMax: number):void;

    updateInfo(variable: string, value: string):void;
}
