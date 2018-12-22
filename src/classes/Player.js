import { forEach, random } from 'lodash';

export default class {
    constructor (game, gamestate, id, name, tint, isAI) {
        this.id = id;
        this.game = game;
        this.gamestate = gamestate;
        this.name = name;
        this.tint = tint;
        this.isAI = isAI;
        this.selectedHexagon = null;
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
            this.selectedHexagon = move.selectedHexagon;
            this.capture(move.targetHexagon);
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
                        selectedHexagon: cell,
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
                    if (this.selectedHexagon !== null) {
                        this.selectedHexagon.unselect();
                    }
                    this.selectedHexagon = targetHexagon.select();
                } else if (targetHexagon.isSelected() === true && targetHexagon === this.selectedHexagon) {
                    targetHexagon.unselect();
                    this.selectedHexagon = null;
                }
            } else if (this.selectedHexagon !== null && targetHexagon.isAdjacentTo(this.selectedHexagon)) {
                this.capture(targetHexagon);
            }
        }

        return true;
    }

    /**
     *
     * @param {*} defender
     */
    capture (defender) {
        let attackerRoll = this.roll(this.selectedHexagon);
        let defenderRoll = this.roll(defender);

        let ratio = attackerRoll / (attackerRoll + defenderRoll);

        this.game.battleBar.showResuls();
        this.game.battleBar.setColors(this.tint, defender.player.tint);
        this.game.battleBar.setBarRatio(ratio);

        if (attackerRoll > defenderRoll) {
            //Success
            this.absorb(defender);
            if (this.selectedHexagon.attack === 1) {
                this.selectedHexagon.unselect();
                this.clearSelection();
            }
            return true;
        } else {
            //Failure
            this.selectedHexagon.attack = 1;
            this.selectedHexagon.updateAttackText();
            if (this.selectedHexagon.attack === 1) {
                this.selectedHexagon.unselect();
                this.clearSelection();
            }
            return false;
        }
    }

    /**
     *
     * @param {*} absorbedHexagon
     */
    absorb (absorbedHexagon) {
        //Before absorbing the territory, update territory count
        this.increaseTerritory();
        absorbedHexagon.player.decreaseTerritory();

        //Take the absorbedHexagon as our own
        absorbedHexagon.player = this;

        //Inherit attack value from the attacker
        absorbedHexagon.attack = this.selectedHexagon.attack - 1;
        absorbedHexagon.updateAttackText();

        //Drop the attack value of the attacker hexagon
        this.selectedHexagon.attack = 1;
        this.selectedHexagon.updateAttackText();

        //Change selection to the newly absorbed hexagon
        this.clearSelection();
        this.selectedHexagon = absorbedHexagon.select();
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
        if (this.selectedHexagon !== null) {
            this.selectedHexagon.unselect();
            this.selectedHexagon = null;
        }
    }

    refreshScore () {
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
