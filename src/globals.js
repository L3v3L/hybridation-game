let exports = {
    ALL_CELLS: null,
    SELECTED_CELL: null,
    CURRENT_PLAYER: 0,
    NUMBER_OF_PLAYERS: 5,
    PLAYER_ARRAY: [],
    AI_MOVE_DELAY_MS: 100,
    WORLD_WIDTH: 10,
    WORLD_HEIGHT: 10,
    MAX_ATTACK: 8,
    MOVE_POINTS_WEIGHT: 1,
    FRIEND_POINTS_WEIGHT: 3,
    CHAIN_POINTS_WEIGHT: 2,
    PLAYERS_IN_GAME: [],
    TURN_COUNTER: 0,
    NO_USER_TURN: false,
    SHOW_CELL_IDS: false
};

//overides in debug mod
if (process.env.DEBUG === 'true') {
    exports.AI_MOVE_DELAY_MS = process.env.DEBUG_AI_MOVE_DELAY_MS;
    exports.NO_USER_TURN = (process.env.DEBUG_NO_USER_TURN === 'true');
    exports.SHOW_CELL_IDS = (process.env.DEBUG_SHOW_CELL_IDS === 'true');
}

export default exports;
