export default class {
    constructor (game) {
        this.game = game;
    }

    changeCurrentPlayer (playerId) {
        this.game.global.CURRENT_PLAYER = playerId;
    }

    getCell (id) {
        for (let index = 0; index < this.game.global.ALL_CELLS.length; index++) {
            if (this.game.global.ALL_CELLS[index].id === id) {
                return this.game.global.ALL_CELLS[index];
            }
        }
    }

    getGlobals () {
        return this.game.global;
    }

    restartBattle () {
        this.game.state.start('Battle');
    }
}
