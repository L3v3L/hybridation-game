//globals __DEV__
import Phaser from 'phaser';
import Hexagon from '../sprites/Hexagon';
import Cell from '../classes/Cell';
import globals from '../globals';
import {clone, random} from 'lodash';
import Player from '../classes/Player';
import Hud from '../classes/Hud';

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
            this.game.global.PLAYER_ARRAY.push(new Player(
                this.game,
                i,
                `Player ${i + 1}`,
                $acceptedPlayerColors[i % $acceptedPlayerColors.length],
                this.nextTurn
            ));
        }

        for (let i = 1; i < this.game.global.NUMBER_OF_PLAYERS; i++) {
            this.game.global.PLAYER_ARRAY[i].isAI = true;
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
                attack: random(1, 6),
                state: 1
            });

            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);
        }

        this.game.global.ALL_CELLS = $cellArray;

        //set starting player
        this.game.global.CURRENT_PLAYER = 0;

        this.game.global.FIRST_TURN = 1;

        //initialize HUD
        this.game.hud = new Hud({
            game: this.game,
            player: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER]
        });
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

    nextTurn () {
        this.game.global.CURRENT_PLAYER = (this.game.global.CURRENT_PLAYER + 1) % this.game.global.NUMBER_OF_PLAYERS;
        let currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
        currentPlayer.act();
    }
}
