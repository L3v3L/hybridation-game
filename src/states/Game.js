//globals __DEV__
import Phaser from 'phaser';
import Hexagon from '../sprites/Hexagon';
import TextButton from '../extensions/TextButton';
import Cell from '../classes/Cell';
import globals from '../globals';
import { clone, random } from 'lodash';
import Player from '../classes/Player';
import Hud from '../classes/Hud.js';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        const $acceptedPlayerColors = [
            Phaser.Color.VIOLET,
            Phaser.Color.AQUA,
            Phaser.Color.GREEN,
            Phaser.Color.YELLOW,
            Phaser.Color.ORANGE,
            Phaser.Color.BLUE
        ];

        const $numberPlayers = 5;
        let $cellWidth = 50;
        let $cellHeight = 20;

        //load globals
        this.initGlobals();

        //generate players
        for (let i = 0; i < $numberPlayers; i++) {
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
                arrayMap: $cellArray[i],
                player: (this.game.global.PLAYER_ARRAY[random(this.game.global.PLAYER_ARRAY.length - 1)]),
                attack: random(1, 24),
                state: 1
            });

            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);
        }

        this.game.global.ALL_CELLS = $cellArray;

        //enable player
        this.game.global.PLAYER_ENABLED = true;

        //HUD
        this.game.hud = new Hud({
            game: this.game,
            player: this.player
        });

        //add end turn button
        let endTurnButton = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: 100,
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
        let $worldWidth = 40;
        let $worldHeight = 20;

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
                //search for cell with specific coor
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
        this.game.global.PLAYER_ENABLED = false;
        if (this.game.global.SELECTED_CELL) {
            this.game.global.SELECTED_CELL.asset.unselect();
        }
    }
}
