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
        this.score = 0;
        this.timer = this.game.time.create(false);
        this.clusters = [];
        this.playerBadge = null;
        this.cells = [];
    }

    generateClusters () {
        //reset clusters
        this.clusters = [];

        //create a list of players cell to get processed
        let toProcess = this.cells.map((item) => {
            return item;
        });

        while (toProcess.length) {
            let middleArray = [];
            let cluster = [];

            //get first item to process
            middleArray.push(toProcess.pop());

            while (middleArray.length) {
                //get first item to find same player connections
                let pivot = middleArray.pop();

                //get all pivots connections with same player and havent yet been processed
                let samePlayerConnections = pivot.connections.filter((connCell) => {
                    if (connCell.player.id === pivot.player.id) {
                        let tempProcessLength = toProcess.length;

                        toProcess = toProcess.filter(item => {
                            return (item.id !== connCell.id);
                        });

                        //only return elements that havent yet been removed from toProcess
                        return (tempProcessLength !== toProcess.length);
                    }
                    return false;
                });

                //move pivot to cluster
                cluster.push(pivot);
                //add new cells
                middleArray = middleArray.concat(samePlayerConnections);

                //if middleArray empty ship new finished cluster
                if (middleArray.length === 0 && cluster.length) {
                    cluster.map((cell) => {
                        cell.clusterBelongs = cluster;
                        return cell;
                    });
                    this.clusters.push(cluster);
                }
            }
        }
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
            this.tryCapture(move.targetCell);
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
                        targetCell: targetCell
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
     * @param {*} targetCell
     */
    interact (targetCell) {
        if (this.isAI) {
            return false;
        }

        if (targetCell !== null) {
            if (targetCell.isOwnedBy(this.id)) {
                if (targetCell.isSelected() === false && targetCell.attack > 1) {
                    //remove selection from last selected
                    if (this.selectedCell !== null) {
                        this.selectedCell.unselect();
                    }
                    this.selectedCell = targetCell.select();
                } else if (targetCell.isSelected() === true && targetCell === this.selectedCell) {
                    targetCell.unselect();
                    this.selectedCell = null;
                }
            } else if (this.selectedCell !== null && targetCell.isAdjacentTo(this.selectedCell)) {
                this.tryCapture(targetCell);
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
        //Take the absorbedCell as our own
        absorbedCell.player = this;

        //Inherit attack value from the attacker
        absorbedCell.attack = this.selectedCell.attack - 1;
        absorbedCell.updateAttackText();

        //Drop the attack value of the attacker cell
        this.selectedCell.attack = 1;
        this.selectedCell.updateAttackText();

        //Change selection to the newly absorbed cell
        this.clearSelection();
        this.selectedCell = absorbedCell.select();
    }

    /**
     *
     * @param {*} cell
     */
    roll (cell) {
        let roll = 0;
        let n = 0;

        while (n < cell.attack) {
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

    setScore (score) {
        this.score = score;
    }

    getTerritory () {
        return this.cells.length;
    }

    endTurn () {
        this.gamestate.nextTurn();
    }

    getHighestClusterLength () {
        let length = 0;
        forEach(this.clusters, function (cluster) {
            let clusterLength = 0;
            if (cluster) {
                clusterLength = cluster.length;
            }

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

    distributeAttack () {
        //get largest chain
        let highestChain = this.getHighestClusterLength();
        let playersCells = this.getAllCellsInAllClusters();

        if (playersCells.length) {
            for (let i = 0; i < highestChain; i++) {
                if (!playersCells.length) {
                    break;
                }

                let randomCellId = random(playersCells.length - 1);
                //remove cell if reached max
                if (playersCells[randomCellId].attack >= this.game.global.MAX_ATTACK) {
                    playersCells.splice(randomCellId, 1);
                    i--;
                    continue;
                }

                playersCells[randomCellId].increaseAttack();
            }
        }
    }
}
