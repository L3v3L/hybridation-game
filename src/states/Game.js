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
                arrayMap: $cellArray[i]
            });

            hexagon.tint = Phaser.Color.AQUA;
            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);
        }

        this.game.global.ALL_CELLS = $cellArray;

        //enable player
        this.game.global.PLAYER_ENABLED = true;
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
}
