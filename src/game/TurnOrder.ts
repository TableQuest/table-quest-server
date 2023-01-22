import Entity from "../models/entity";
import Game, {GameState} from "../models/game";


export default class TurnOrder {

    orderList: Array<Entity>;
    private game: Game;
    tbdEntity: Array<Entity>;
    initialized: boolean;
    currentEntityTurnIndex: number;

    constructor(game: Game) {
        this.game = game;
        this.orderList = [];
        this.tbdEntity = [];
    }

    initOrder() {
        this.tbdEntity = [];
        this.orderList = [];
        this.currentEntityTurnIndex = 0;
        for (let playerS of this.game.playerSockets) {
            this.tbdEntity.push(playerS.player.character);
        }
        for (let npc of this.game.npcTable) {
            this.tbdEntity.push(npc);
        }
        this.initialized = true;
    }

    addEntity(entity: Entity, diceValue: number) {
        console.log(`Adding entity ${entity.name} with id ${entity.pawncode} !`)
        let index = this.orderList.length-1;
        for (let i = this.orderList.length-1; i >= 0; i--) {
            let e = this.orderList[i];
            if (diceValue >= e.diceVal) {
                index = i;
            }
        }
        entity.diceVal = diceValue;
        this.orderList.splice(index, 0, entity);
        this.removeEntityTbd(entity);
    }

    removeEntityTbd(entity: Entity) {
        let index = this.tbdEntity.indexOf(entity);
        this.tbdEntity.splice(index, 1);
        if (this.tbdEntity.length <= 0) {
            this.game.updateGameState(GameState.TURN_ORDER);
            this.currentEntityTurnIndex = 0;
            console.log(`All players and npc did their speed throw for the turn order. Let's fight !`);
            this.game.logger.log("Images/information", "Game State", `GameState is now ${GameState[this.game.gameState]}`)
                .sendToEveryone();
            this.game.tableSocket?.socket.emit("switchState", "TURN_ORDER");
            this.sendOrderList();
        }
    }

    sendOrderList() {
        let list = [];
        for (let entity of this.orderList) {
            if (this.game.isNpcPlacedExist(entity.pawncode)) {
                list.push(entity.pawncode);
                continue;
            }
            for (let playerS of this.game.playerSockets) {
                if (playerS.player.pawnCode === entity.pawncode) {
                    list.push(playerS.player.id);
                }
            }
        }
        if (list.length !== this.orderList.length) {
            console.log("Turn Order Error : the length of the list send to the server is not equal to the order list !");
        }
        console.table(list);
        this.game.tableSocket?.socket.emit("turnOrder", {"list": list});
    }

    isPlayerTurn(playerId: string) {
        let pawnCode = this.game.getPlayer(playerId).character.pawncode;

        //console.log(`Is player Turn ? : ${this.game.gameState !== GameState.TURN_ORDER} ${this.game.gameState !== GameState.INIT_TURN_ORDER} ${this.orderList[this.currentEntityTurnIndex].pawncode === pawnCode}`)
        return this.game.gameState !== GameState.TURN_ORDER
            && this.game.gameState !== GameState.INIT_TURN_ORDER
            || this.orderList[this.currentEntityTurnIndex].pawncode === pawnCode;
    }

    removeEntity(entity: Entity) {
        let index = this.orderList.indexOf(entity);
        if (index !== -1) {
            if (index >= this.currentEntityTurnIndex) {
                this.orderList.splice(index, 1);
                if (this.currentEntityTurnIndex === this.orderList.length) this.currentEntityTurnIndex = 0;
            } else {
                this.orderList.splice(index, 1);
                this.currentEntityTurnIndex--;
            }
        }
        this.game.removeNpc(entity);
    }

    next() {
        this.currentEntityTurnIndex++;
        if (this.currentEntityTurnIndex >= this.orderList.length) this.currentEntityTurnIndex = 0;
        this.game.tableSocket?.socket.emit("turnOrderNext", {});
        this.game.logger.log(this.orderList[this.currentEntityTurnIndex].image,
            "Game",
            `It is ${this.orderList[this.currentEntityTurnIndex].name}'s turn.`)
            .sendToEveryone();
    }

    checkIfTargetDead(targetId: string) {
        let entity = this.game.getEntityById(targetId) as unknown as Entity;
        if (entity !== undefined && entity.life <= 0) {
            console.log(`Entity ${entity.name} is dead !`);
            this.removeEntity(entity);
            this.game.removeEntityById(targetId);
        }
        else {
            console.log(`Error : Entity ${targetId} not found !`);
        }
    }

    isInOrder(entity: Entity) {
        for (let e of this.orderList) {
            if (e.pawncode === entity.pawncode) {
                return true;
            }
        }
        return false;
    }

    getCurrentEntity() {
        return this.orderList[this.currentEntityTurnIndex];
    }
}






















