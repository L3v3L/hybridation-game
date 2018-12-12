export default class {
    constructor (game) {
        this.game = game;
    }

    changeCurrentPlayer (playerId) {
        this.game.global.CURRENT_PLAYER = playerId;
    }
}
