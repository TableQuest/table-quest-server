import Game, {GameState} from "../models/game";
import Entity from "../models/entity";



enum Dice {
    D4,
    D6,
    D8,
    D12,
    D20,
    D100,
}

export default class DiceManager {
    private game: Game;

    currentPlayerIdTryingSkill: string;

    constructor(game: Game) {
        this.game = game;
    }

    throwDice(entityId: string, dice: Dice, value: number) {
        // TODO (pour les attaques)
    }

    checkDiceValue(entityId: string, diceId: number, value: number) {
        let entity = this.game.getEntityById(entityId) as unknown as Entity;

        let dice = this.getDiceByValue(diceId);

        this.game.logger.log(
            entity?.image,
            entity?.name,
            `Roll a D20 dice and did ${value}`
        ).sendToEveryone();

        console.log(`DEBUG ${this.game.gameState === GameState.INIT_TURN_ORDER} ${dice === Dice.D20} ${entity !== undefined} ${!this.game.turnOrder.isInOrder(entity)} `);
        if (this.game.gameState === GameState.INIT_TURN_ORDER && dice === Dice.D20 && entity !== undefined && !this.game.turnOrder.isInOrder(entity)) {
            this.game.turnOrder.addEntity(entity, value);
            console.log(`Player ${entity.pawncode} is trow a die and did ${value} !`);
        }
    }

    getDiceByValue(diceId: number) {
        switch (diceId) {
            case 0:
                return Dice.D4;
            case 1:
                return Dice.D6;
            case 2:
                return Dice.D8;
            case 3:
                return Dice.D12;
            case 4:
                return Dice.D20;
            case 5:
                return Dice.D100;
            default:
                return Dice.D20;
        }
    }
}