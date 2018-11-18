//globals __DEV__
import Phaser from 'phaser';
import Hexagon from '../sprites/Hexagon';
import Cell from '../classes/Cell';
import globals from '../globals';
import { clone } from 'lodash';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        let $cellWidth = 50;
        let $cellHeight = 20;

        //load globals
        this.initGlobals();
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
                player: (Math.floor(Math.random() * 5) + 1),
                attack: (Math.floor(Math.random() * 24) + 1),
                state: 1
            });

            switch (hexagon.player) {
                case 0:
                    hexagon.tint = Phaser.Color.RED;
                    break;
                case 1:
                    hexagon.tint = Phaser.Color.VIOLET;
                    break;
                case 2:
                    hexagon.tint = Phaser.Color.AQUA;
                    break;
                case 3:
                    hexagon.tint = Phaser.Color.GREEN;
                    break;
                case 4:
                    hexagon.tint = Phaser.Color.YELLOW;
                    break;
                case 5:
                    hexagon.tint = Phaser.Color.ORANGE;
                    break;
                default:
                    hexagon.tint = Phaser.Color.WHITE;
            }

            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);

            let textStyle = {
                font: '8pt Consolas',
                fill: 'white',
                stroke: true,
                strokeWidth: 1,
                wordWrap: false,
                align: 'center'
            };

            let attackText = this.game.add.text(hexagon.centerX, hexagon.centerY + 2, hexagon.attack, textStyle);
            attackText.smoothed = false;
            attackText.setShadow(1, 1, 'rgba(0,0,0,1)', 0);
            attackText.anchor.set(0.5);
        }

        this.game.global.ALL_CELLS = $cellArray;

        //enable player
        this.game.global.PLAYER_ENABLED = true;

        //end turn button
        let endTurnButton = this.game.add.button(
            this.game.world.centerX,
            100,
            'btn',
            this.endTurnAction,
            this,
            0,
            1,
            2,
            3);
        endTurnButton.width = 150;
        endTurnButton.height = 50;
        endTurnButton.anchor.x = 0.5;
        endTurnButton.anchor.y = 0.5;
        endTurnButton.input.useHandCursor = true;
        endTurnButton.tint = Phaser.Color.AQUA;
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
    }
}
