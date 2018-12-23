import { forEach, random } from 'lodash';

export default class {
    constructor (game, gamestate, id, name, tint, isAI) {
        this.id = id;
        this.game = game;
        this.gamestate = gamestate;
        this.name = name;
        this.tint = tint;
        this.isAI = isAI;
        this.selectedCell = null;
        this.territory = 0;
        this.score = 0;
        this.timer = this.game.time.create(false);
        this.clusters = [];
        this.playerBadge = null;
    }

    act () {
        if (this.isAI) {
            this.timer.loop(this.game.global.AI_MOVE_DELAY_MS, this.playMove, this);
            this.timer.start();
        }
    }

    playMove () {
        let move = this.generateMove();
        if (move !== null) {
            this.selectedCell = move.selectedCell;
            this.tryCapture(move.targetHexagon);
            this.clearSelection();
        } else {
            this.timer.stop(true);
            this.endTurn();
        }
    }

    generateMove () {
        let possibleMoves = [];
        let playerId = this.id;

        //find best play for each players cell
        forEach(this.game.global.ALL_CELLS, function (cell) {
            if (cell.player.id === playerId && cell.attack > 1) {
                let possibleMovesTemp = cell.scoreMoves();
                let newMove = null;
                if (typeof possibleMovesTemp === 'object' && possibleMovesTemp.length > 0) {
                    let highestValue = Math.max.apply(Math, possibleMovesTemp.map(function (o) {
                        return o.totalPoints;
                    }));

                    let targetCell = possibleMovesTemp.find(function (o) {
                        return o.totalPoints === highestValue;
                    }, highestValue);

                    newMove = {
                        selectedCell: cell,
                        targetHexagon: targetCell
                    };
                }
                if (newMove !== null) {
                    possibleMoves.push(newMove);
                }
            }
        });

        //find best play
        let bestMove = null;
        forEach(possibleMoves, function (play) {
            if (bestMove === null || play.diff > bestMove.diff) {
                bestMove = play;
            }
        });

        return bestMove;
    }

    /**
     *
     * @param {*} targetHexagon
     */
    interact (targetHexagon) {
        if (this.isAI) {
            return false;
        }

        if (targetHexagon !== null) {
            if (targetHexagon.isOwnedBy(this.id)) {
                if (targetHexagon.isSelected() === false && targetHexagon.attack > 1) {
                    //remove selection from last selected
                    if (this.selectedCell !== null) {
                        this.selectedCell.unselect();
                    }
                    this.selectedCell = targetHexagon.select();
                } else if (targetHexagon.isSelected() === true && targetHexagon === this.selectedCell) {
                    targetHexagon.unselect();
                    this.selectedCell = null;
                }
            } else if (this.selectedCell !== null && targetHexagon.isAdjacentTo(this.selectedCell)) {
                this.tryCapture(targetHexagon);
            }
        }

        return true;
    }

    /**
     *
     * @param {*} defender
     */
    tryCapture (defenderCell) {
        let attackerRoll = this.roll(this.selectedCell);
        let defenderCellRoll = this.roll(defenderCell);

        let ratio = attackerRoll / (attackerRoll + defenderCellRoll);

        this.game.battleBar.showResuls();
        this.game.battleBar.setColors(this.tint, defenderCell.player.tint);
        this.game.battleBar.setBarRatio(ratio);

        if (attackerRoll > defenderCellRoll) {
            //Success
            this.takeControlOfCell(defenderCell);
            if (this.selectedCell.attack === 1) {
                this.selectedCell.unselect();
                this.clearSelection();
            }
            return true;
        } else {
            //Failure
            this.selectedCell.attack = 1;
            this.selectedCell.updateAttackText();
            if (this.selectedCell.attack === 1) {
                this.selectedCell.unselect();
                this.clearSelection();
            }
            return false;
        }
    }

    /**
     *
     * @param {*} absorbedCell
     */
    takeControlOfCell (absorbedCell) {
        //Before absorbing the territory, update territory count
        this.increaseTerritory();
        absorbedCell.player.decreaseTerritory();

        //Take the absorbedCell as our own
        absorbedCell.player = this;

        //Inherit attack value from the attacker
        absorbedCell.attack = this.selectedCell.attack - 1;
        absorbedCell.updateAttackText();

        //Drop the attack value of the attacker hexagon
        this.selectedCell.attack = 1;
        this.selectedCell.updateAttackText();

        //Change selection to the newly absorbed hexagon
        this.clearSelection();
        this.selectedCell = absorbedCell.select();
    }

    /**
     *
     * @param {*} hexagon
     */
    roll (hexagon) {
        let roll = 0;
        let n = 0;

        while (n < hexagon.attack) {
            roll += random(1, 6);
            n++;
        }
        return roll;
    }

    clearSelection () {
        if (this.selectedCell !== null) {
            this.selectedCell.unselect();
            this.selectedCell = null;
        }
    }

    updateScore () {
        this.score = this.getHighestClusterLength();
        if (this.score === 0) {
            this.playerBadge.hide();
        }
    }

    getScore (score) {
        return this.score;
    }

    setScore (score) {
        this.score = score;
    }

    getTerritory (count) {
        this.territory = count;
    }

    setTerritory (count) {
        this.territory = count;
    }

    increaseTerritory () {
        this.territory = this.territory + 1;
    }

    decreaseTerritory () {
        this.territory = this.territory - 1;
    }

    endTurn () {
        this.gamestate.nextTurn();
    }

    getHighestClusterLength () {
        let length = 0;
        forEach(this.clusters, function (cluster) {
            let clusterLength = cluster.length;
            if (clusterLength > length) {
                length = clusterLength;
            }
        });
        return length;
    }

    getAllCellsInAllClusters () {
        let cells = [];
        forEach(this.clusters, function (cluster) {
            forEach(cluster, function (cell) {
                cells.push(cell);
            });
        });
        return cells;
    }
}
