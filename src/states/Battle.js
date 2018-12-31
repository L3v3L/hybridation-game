//globals __DEV__
import Phaser from 'phaser';
import Cell from '../sprites/Cell';
import globals from '../globals';
import { cloneDeep, forEach, shuffle, floor } from 'lodash';
import Player from '../classes/Player';
import Hud from '../classes/Hud';
import BattleBar from '../classes/BattleBar';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        //load globals
        this.initGlobals();
        //set world dimensions
        this.worldWidth = this.game.global.WORLD_WIDTH;
        this.worldHeight = this.game.global.WORLD_HEIGHT;
        this.cellWidth = this.game.global.CELL_WIDTH;
        this.cellHeight = this.game.global.CELL_HEIGHT;

        //initalze players
        this.initPlayers();

        //generate tiles
        this.game.global.ALL_CELLS = this.createWorldArray();

        //set starting player
        this.game.global.CURRENT_PLAYER = 0;

        this.game.global.FIRST_TURN = 1;

        this.resetTerritories();
        this.updateData();
        this.updateAllScore();

        //initialize HUD
        this.game.hud = new Hud({
            game: this.game,
            player: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER]
        });

        //initialize BattleBar
        this.game.battleBar = new BattleBar({game: this.game});
    }

    render () {
    }

    initGlobals () {
        this.game.global = cloneDeep(globals);
    }

    initPlayers () {
        //generate players
        for (let i = 0; i < this.game.global.NUMBER_OF_PLAYERS; i++) {
            this.game.global.PLAYER_ARRAY.push(new Player(
                this.game,
                this,
                i,
                `Player ${i + 1}`,
                this.game.global.COLOR_PALETTE[i % this.game.global.COLOR_PALETTE.length],
                true
            ));
        }

        //config user player
        this.game.global.PLAYER_ARRAY[0].isAI = false;
    }

    createPlayerAssignmentArray () {
        let playerAssignmentArray = [];
        let countCells = this.worldWidth * this.worldHeight;
        let countPlayers = this.game.global.PLAYER_ARRAY.length;
        //todo handle floats
        let amountCellsEachPlayer = countCells / countPlayers;

        for (let i = 0; i < countPlayers; i++) {
            for (let j = 0; j < amountCellsEachPlayer; j++) {
                playerAssignmentArray.push(i);
            }
        }

        return shuffle(playerAssignmentArray);
    }

    createAttackAssignmentArray () {
        let countCells = this.worldWidth * this.worldHeight;
        let countPlayers = this.game.global.PLAYER_ARRAY.length;
        let amountCellsEachPlayer = countCells / countPlayers;

        let divider = (100 - amountCellsEachPlayer) * 0.01;
        let pie = amountCellsEachPlayer;
        let minAttack = 1;
        let attackAssignmentArray = [];
        let playerAttackArray = [];

        while (pie > 1) {
            let divided = floor(pie * divider);
            let toFill = pie - divided;
            //fill
            for (let i = 0; i < toFill; i++) {
                playerAttackArray.push(minAttack > this.game.global.MAX_ATTACK ? 1 : minAttack);
            }
            minAttack++;
            pie = divided;
        }

        while (playerAttackArray.length < amountCellsEachPlayer) {
            playerAttackArray.push(1);
        }

        for (let i = 0; i < countPlayers; i++) {
            attackAssignmentArray[i] = shuffle(playerAttackArray);
        }

        return attackAssignmentArray;
    }

    createArrayCells (createPlayerAssignmentArray, attackAssignmentArray) {
        let cellArray = [];

        for (let i = 0; i < this.worldWidth * this.worldHeight; i++) {
            let player = (this.game.global.PLAYER_ARRAY[createPlayerAssignmentArray[i % (this.worldWidth * this.worldHeight)]]);
            let cell = new Cell({
                game: this.game,
                x: null,
                y: null,
                width: this.cellWidth,
                height: this.cellHeight,
                asset: 'hexagon',
                player: player,
                attack: attackAssignmentArray[player.id].pop(),
                state: 1,
                id: i,
                connectionCount: 6
            });
            cellArray.push(cell);
        }

        return cellArray;
    }

    connectCellArray (cellArray) {
        let cellsToFill = [];

        cellArray[0].setPosition([0, 0]);
        cellsToFill.push(cellArray[0]);

        while (cellsToFill.length) {
            let selectedCell = cellsToFill.pop();
            let selectedNode = selectedCell.findFirst(true, true);
            if (selectedNode !== -1) {
                //search for cell with specific coordinate
                let nextCor = selectedCell.getNextPosition(selectedNode);
                let connectionMade = false;

                for (let i = 0; i < cellsToFill.length; i++) {
                    if (cellsToFill[i].getPosition() === nextCor) {
                        selectedCell.connectNode(cellsToFill[i], selectedNode);
                        cellsToFill.push(selectedCell);
                        connectionMade = true;
                        break;
                    }
                }

                if (!connectionMade) {
                    for (let i = 0; i < cellArray.length; i++) {
                        if (cellArray[i].getPosition() === null) {
                            let newCellToAdd = cellArray[i];
                            newCellToAdd.setPosition(nextCor);
                            selectedCell.connectNode(newCellToAdd, selectedNode);
                            cellsToFill.unshift(newCellToAdd);
                            cellsToFill.push(selectedCell);
                            break;
                        }
                    }
                }
            }
        }

        return cellArray;
    }

    addCellsToWorld (cellArray) {
        return cellArray.map(function (item) {
            item.x = (item.cellX * ((this.cellWidth / 4) * 3)) + this.game.world.centerX;
            item.y = (item.cellY * (this.cellHeight / 2)) + this.game.world.centerY;
            this.game.add.existing(item);
            return item;
        }, this);
    }

    /**
     *
     */
    createWorldArray () {
        let cellArray = this.createArrayCells(this.createPlayerAssignmentArray(), this.createAttackAssignmentArray());
        cellArray = this.connectCellArray(cellArray);
        cellArray = this.addCellsToWorld(cellArray);
        return cellArray;
    }

    resetTerritories () {
        forEach(this.game.global.PLAYER_ARRAY, function (player) {
            //reset cells
            player.cells = [];
            //reset clusters
            player.clusters = [];
            //clear territory counts
            player.setTerritory(0);
        });
    }

    updateData () {
        //todo convert to javascript.map
        forEach(this.game.global.ALL_CELLS, function (cell) {
            //todo fix territory to user player.cell array
            cell.player.increaseTerritory();
            //todo find better way to do this
            //add all player cells to its array
            cell.player.cells.push(cell);
        });

        this.game.global.PLAYER_ARRAY.map((player) => {
            player.generateClusters();
        });
    }

    updateAllScore () {
        forEach(this.game.global.PLAYER_ARRAY, function (player) {
            player.updateScore();
        });
    }

    nextTurn () {
        if (this.game.global.NO_USER_TURN) {
            this.game.global.PLAYER_ARRAY[0].isAI = true;
        }

        let playersInGame = this.getPlayersInGame();

        if (playersInGame.length < 2) {
            this.game.global.PLAYERS_IN_GAME = playersInGame;
            this.state.start('GameOver');
        } else {
            this.game.global.TURN_COUNTER++;
            this.resetTerritories();
            this.updateData();
            this.updateAllScore();
            this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER].distributeAttack();

            let currentPlayer = this.getNextPlayerWithPruning(playersInGame);
            currentPlayer.act();
        }
    }

    getNextPlayerWithPruning (playersInGame) {
        let currentPlayer = null;
        let isPlayerInGame = false;
        do {
            this.game.global.CURRENT_PLAYER = (this.game.global.CURRENT_PLAYER + 1) % this.game.global.NUMBER_OF_PLAYERS;
            currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
            isPlayerInGame = false;
            for (let i = 0; i < playersInGame.length; i++) {
                if (playersInGame[i].id === currentPlayer.id) {
                    isPlayerInGame = true;
                }
            }
        } while (!isPlayerInGame);
        return currentPlayer;
    }

    getPlayersInGame () {
        return this.game.global.PLAYER_ARRAY.filter(function (player) {
            for (let i = 0; i < this.worldWidth * this.worldHeight; i++) {
                if (this.game.global.ALL_CELLS[i].player.id === player.id) {
                    return true;
                }
            }
        }, this);
    }
}
