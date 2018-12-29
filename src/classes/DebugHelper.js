import Cell from "../sprites/Cell";

export default class {
    constructor (game) {
        this.game = game;
        this.selectedCell = null;
        this.selectedCellWatchVariable = null;
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

    selectOutput (obj) {
        switch (true) {
            case obj instanceof Cell:

                if (this.selectedCellWatchVariable) {
                    if (typeof this.selectedCellWatchVariable === 'string') {
                        this.selectedCellWatchVariable = [this.selectedCellWatchVariable];
                    }

                    this.selectedCellWatchVariable.map(function (watch) {
                        console.log(`${watch}: ${obj[watch]}`);
                    }, obj);
                } else {
                    console.log(obj);
                }

                this.selectedCell = obj;
                break;
            default:
                break;
        }
    }
}
