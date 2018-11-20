//globals __DEV__
import Phaser from 'phaser';
import Hexagon from '../sprites/Hexagon';
import TextButton from '../extensions/TextButton';
import Cell from '../classes/Cell';
import globals from '../globals';
import { clone, forEach, random } from 'lodash';
import Player from '../classes/Player';
import Hud from '../classes/Hud.js';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        //settings
        const $acceptedPlayerColors = [
            Phaser.Color.VIOLET,
            Phaser.Color.AQUA,
            Phaser.Color.GREEN,
            Phaser.Color.YELLOW,
            Phaser.Color.ORANGE,
            Phaser.Color.BLUE
        ];

        //load globals
        this.initGlobals();
        let $cellWidth = 50;
        let $cellHeight = 20;

        //generate players
        for (let i = 0; i < this.game.global.NUMBER_OF_PLAYERS; i++) {
            this.game.global.PLAYER_ARRAY.push(new Player(i, `Player ${i + 1}`, $acceptedPlayerColors[i % $acceptedPlayerColors.length]));
        }

        //generate tiles
        let $cellArray = this.createWorldArray();
        for (let i = 0; i < $cellArray.length; i++) {
            let hexagon = new Hexagon({
                game: this.game,
                x: ($cellArray[i].x * (($cellWidth / 4) * 3)) + this.game.world.centerX,
                y: ($cellArray[i].y * ($cellHeight / 2)) + this.game.world.centerY,
                width: $cellWidth,
                height: $cellHeight,
                asset: 'hexagon',
                id: $cellArray[i].id,
                cell: $cellArray[i],
                player: (this.game.global.PLAYER_ARRAY[random(this.game.global.PLAYER_ARRAY.length - 1)]),
                attack: random(1, 24),
                state: 1
            });

            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);
        }

        this.game.global.ALL_CELLS = $cellArray;

        //set starting player
        this.game.global.CURRENT_PLAYER = 0;

        //initialize HUD
        this.game.hud = new Hud({
            game: this.game,
            player: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER]
        });

        //add end turn button
        let endTurnButton = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: 60,
            asset: 'button',
            callback: this.endTurnAction,
            callbackContext: this,
            overFrame: 2,
            outFrame: 1,
            downFrame: 0,
            upFrame: 1,
            tint: Phaser.Color.WHITE,
            label: 'End Turn',
            style: {
                font: '20px Arial',
                fontWeight: 'bold',
                fill: 'white',
                align: 'center'
            }
        });

        this.game.add.existing(endTurnButton);
    }

    initGlobals () {
        this.game.global = clone(globals);
    }

    render () {
        if (__DEV__) {
            //this.game.debug.spriteInfo(this.hexagon, 32, 32);
        }
    }

    /**
     *
     */
    createWorldArray () {
        let $worldWidth = 10;
        let $worldHeight = 10;

        let $cellArray = [];
        let $cellsToFill = [];

        for (let i = 0; i < $worldWidth * $worldHeight; i++) {
            $cellArray.push(new Cell(i, 6));
        }

        $cellArray[0].setPosition([0, 0]);
        $cellsToFill.push($cellArray[0]);

        while ($cellsToFill.length) {
            let $selectedCell = $cellsToFill.pop();
            let $selectedNode = $selectedCell.findFirst(true, true);
            if ($selectedNode !== -1) {
                //search for cell with specific coordinate
                let $nextCor = $selectedCell.getNextPosition($selectedNode);
                let $connectionMade = false;

                for (let i = 0; i < $cellsToFill.length; i++) {
                    if ($cellsToFill[i].getPosition() === $nextCor) {
                        $selectedCell.connectNode($cellsToFill[i], $selectedNode);
                        $cellsToFill.push($selectedCell);
                        $connectionMade = true;
                        break;
                    }
                }

                if (!$connectionMade) {
                    for (let i = 0; i < $cellArray.length; i++) {
                        if ($cellArray[i].getPosition() === null) {
                            let newCellToAdd = $cellArray[i];
                            newCellToAdd.setPosition($nextCor);
                            $selectedCell.connectNode(newCellToAdd, $selectedNode);
                            $cellsToFill.unshift(newCellToAdd);
                            $cellsToFill.push($selectedCell);
                            break;
                        }
                    }
                }
            }
        }

        return $cellArray;
    }

    endTurnAction () {
        //TODO actions when turn has ended
        //increment current player
        this.game.global.CURRENT_PLAYER = (this.game.global.CURRENT_PLAYER + 1) % this.game.global.NUMBER_OF_PLAYERS;

        if (this.game.global.SELECTED_CELL) {
            this.game.global.SELECTED_CELL.asset.unselect();
        }

        if (this.game.global.CURRENT_PLAYER !== 0) {
            let $play = this.playAI();
            while ($play !== null) {
                $play.attacker.battle($play.attacker, $play.defender);
                $play = this.playAI();
            }
            console.log('end turn');
        }

    }

    playAI () {
        let $currentPlayer = this.game.global.CURRENT_PLAYER;
        let $possiblePlays = [];

        //find best play for each players cell
        forEach(this.game.global.ALL_CELLS, function (cell) {
            if (cell.asset.player.id === $currentPlayer) {
                let $possiblePlay = null;
                let $smallestConnectionAttack = null;
                forEach(cell.connections, function (connection) {
                    //find biggest diff play
                    if (typeof connection === 'object' &&
                        connection.asset.player.id !== cell.asset.player.id &&
                        connection.asset.attack < cell.asset.attack &&
                        ($smallestConnectionAttack === null || connection.asset.attack < $smallestConnectionAttack)
                    ) {
                        $smallestConnectionAttack = connection.asset.attack;
                        $possiblePlay = {
                            attacker: cell.asset,
                            defender: connection.asset,
                            diff: (cell.asset.attack - connection.asset.attack)
                        };
                    }
                });
                if ($possiblePlay !== null) {
                    $possiblePlays.push($possiblePlay);
                }
            }
        });

        //find best play
        let $bestPlay = null;
        forEach($possiblePlays, function ($play) {
            if ($bestPlay === null || $play.diff > $bestPlay.diff) {
                $bestPlay = $play;
            }
        });

        return $bestPlay;
    }
}
