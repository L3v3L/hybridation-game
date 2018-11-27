//globals __DEV__
import Phaser from 'phaser';
import Hexagon from '../sprites/Hexagon';
import Cell from '../classes/Cell';
import globals from '../globals';
import { clone, forEach, random, shuffle, floor } from 'lodash';
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
        let $cellHeight = 50;

        //generate players
        for (let i = 0; i < this.game.global.NUMBER_OF_PLAYERS; i++) {
            this.game.global.PLAYER_ARRAY.push(new Player(
                this.game,
                this,
                i,
                `Player ${i + 1}`,
                $acceptedPlayerColors[i % $acceptedPlayerColors.length],
                true
            ));
        }

        //config user player
        this.game.global.PLAYER_ARRAY[0].isAI = false;

        //generate shadow
        let $shadowArray = this.createWorldArray();
        for (let i = 0; i < $shadowArray.length; i++) {
            let $hexagonShadow = new Phaser.Sprite(
                this.game,
                ($shadowArray[i].x * (($cellWidth / 4) * 3)) + this.game.world.centerX + 5,
                ($shadowArray[i].y * ($cellHeight / 2)) + this.game.world.centerY + 5,
                'hexagon');
            $hexagonShadow.anchor.setTo(0.5);
            $hexagonShadow.inputEnabled = false;
            $hexagonShadow.tint = 'black';
            $hexagonShadow.width = $cellWidth;
            $hexagonShadow.height = $cellHeight;

            $shadowArray[i].asset = $hexagonShadow;

            this.game.add.existing($hexagonShadow);

            $hexagonShadow.sendToBack();
        }

        //generate tiles
        let $cellArray = this.createWorldArray();
        this.game.global.ALL_CELLS = $cellArray;

        let createPlayerAssignmentArray = this.createPlayerAssignmentArray();
        let attackAssignmentArray = this.createAttackAssignmentArray();

        for (let i = 0; i < $cellArray.length; i++) {
            let player = (this.game.global.PLAYER_ARRAY[createPlayerAssignmentArray[i % $cellArray.length]]);
            let hexagon = new Hexagon({
                game: this.game,
                x: ($cellArray[i].x * (($cellWidth / 4) * 3)) + this.game.world.centerX,
                y: ($cellArray[i].y * ($cellHeight / 2)) + this.game.world.centerY,
                width: $cellWidth,
                height: $cellHeight,
                asset: 'hexagon',
                id: $cellArray[i].id,
                cell: $cellArray[i],
                player: player,
                attack: attackAssignmentArray[player.id].pop(),
                state: 1
            });

            $cellArray[i].asset = hexagon;

            this.game.add.existing(hexagon);
        }

        //set starting player
        this.game.global.CURRENT_PLAYER = 0;

        this.game.global.FIRST_TURN = 1;

        this.updateData();

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

    createPlayerAssignmentArray () {
        let $playerAssignmentArray = [];
        let $countCells = this.game.global.ALL_CELLS.length;
        let $countPlayers = this.game.global.PLAYER_ARRAY.length;
        //todo handle floats
        let $amountCellsEachPlayer = $countCells / $countPlayers;

        for (let i = 0; i < $countPlayers; i++) {
            for (let j = 0; j < $amountCellsEachPlayer; j++) {
                $playerAssignmentArray.push(i);
            }
        }

        return shuffle($playerAssignmentArray);
    }

    createAttackAssignmentArray () {
        let $countCells = this.game.global.ALL_CELLS.length;
        let $countPlayers = this.game.global.PLAYER_ARRAY.length;
        let $amountCellsEachPlayer = $countCells / $countPlayers;

        let $divider = (100 - $amountCellsEachPlayer) * 0.01;
        let $pie = $amountCellsEachPlayer;
        let $minAttack = 1;
        let $attackAssignmentArray = [];
        let $playerAttackArray = [];

        while ($pie > 1) {
            let $divided = floor($pie * $divider);
            let $toFill = $pie - $divided;
            //fill
            for (let i = 0; i < $toFill; i++) {
                $playerAttackArray.push($minAttack > this.game.global.MAX_ATTACK ? 1 : $minAttack);
            }
            $minAttack++;
            $pie = $divided;
        }

        while ($playerAttackArray.length < $amountCellsEachPlayer) {
            $playerAttackArray.push(1);
        }

        for (let i = 0; i < $countPlayers; i++) {
            $attackAssignmentArray[i] = shuffle($playerAttackArray);
        }

        return $attackAssignmentArray;
    }

    /**
     *
     */
    createWorldArray () {
        let $worldWidth = this.game.global.WORLD_WIDTH;
        let $worldHeight = this.game.global.WORLD_HEIGHT;

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

    updateData () {
        forEach(this.game.global.PLAYER_ARRAY, function ($player) {
            //reset clusters
            $player.clusters = [];
            //clear territory counts
            $player.setTerritory(0);
        });

        forEach(this.game.global.ALL_CELLS, function ($cell) {
            $cell.asset.player.increaseTerritory();

            let $alreadyfoundIn = null;
            forEach($cell.asset.player.clusters, function ($cluster, $key) {
                let $isCellConnectedToAnyInCellArray = $cell.asset.player.isCellConnectedToAnyInCellArray($cell, $cluster);
                if ($isCellConnectedToAnyInCellArray) {
                    if ($alreadyfoundIn !== null) {
                        $cell.asset.player.clusters[$alreadyfoundIn] = $cell.asset.player.clusters[$alreadyfoundIn].concat($cluster);
                        $cell.asset.player.clusters[$key] = [];
                        $cluster = null;
                    } else {
                        $cell.clusterBelongs = $cluster;
                        $cluster.push($cell);
                        $alreadyfoundIn = $key;
                    }
                }
            });

            if ($alreadyfoundIn === null) {
                let $newCluster = [$cell];
                $cell.clusterBelongs = $newCluster;
                $cell.asset.player.clusters.push($newCluster);
            }
        });

        forEach(this.game.global.PLAYER_ARRAY, function ($player) {
            $player.refreshScore();
        });
    }

    nextTurn () {
        if (this.checkGameEnded()) {
            console.log('game ended');
        } else {
            this.updateData();
            this.distribuiteAttack(this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER]);

            this.game.global.CURRENT_PLAYER = (this.game.global.CURRENT_PLAYER + 1) % this.game.global.NUMBER_OF_PLAYERS;
            let currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
            currentPlayer.act();
        }
    }

    checkGameEnded () {
        let $playersInGame = [];
        forEach(this.game.global.ALL_CELLS, function ($cell) {
            $playersInGame[$cell.asset.player.id] = true;
        });

        let $count = 0;
        for (let i = 0; i < $playersInGame.length; ++i) {
            if ($playersInGame[i]) {
                $count++;
            }
        }

        return ($count < 2);
    }

    distribuiteAttack ($player) {
        //get largest chain
        let $highestChain = $player.getHighestClusterLength();
        let $playersCells = $player.getAllCellsInAllClusters();

        if ($playersCells.length) {
            for (let i = 0; i < $highestChain; i++) {
                if (!$playersCells.length) {
                    break;
                }

                let randomCellId = random($playersCells.length - 1);
                //remove cell if reached max
                if ($playersCells[randomCellId].asset.attack >= this.game.global.MAX_ATTACK) {
                    $playersCells.splice(randomCellId, 1);
                    i--;
                    continue;
                }

                $playersCells[randomCellId].asset.increaseAttack();
            }
        }
    }
}
