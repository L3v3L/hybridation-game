import {forEach, random} from 'lodash';

export default class {
    constructor (game, id, name, tint, callback) {
        this.id = id;
        this.game = game;
        this.callback = callback;
        this.name = name;
        this.tint = tint;
        this.isAI = false;
        this.selectedHexagon = null;
        this.timer = this.game.time.create(false);
    }

    act () {
        if (this.isAI) {
            this.timer.loop(this.game.global.AI_MOVE_DELAY_MS, this.playMove, this);
            this.timer.start();
        }
    }

    playMove () {
        let $move = this.generateMove();
        if ($move !== null) {
            this.selectedHexagon = $move.selectedHexagon;
            this.capture($move.targetHexagon);
            this.clearSelection();
        } else {
            this.timer.stop(true);
            this.endTurn();
        }
    }

    generateMove () {
        let possibleMoves = [];
        let $playerId = this.id;

        //find best play for each players cell
        forEach(this.game.global.ALL_CELLS, function (cell) {
            if (cell.asset.player.id === $playerId) {
                let $newMove = null;
                let $smallestConnectionAttack = null;
                forEach(cell.connections, function (connection) {
                    //find biggest diff play
                    if (typeof connection === 'object' &&
                        connection.asset.player.id !== cell.asset.player.id &&
                        connection.asset.attack < cell.asset.attack &&
                        ($smallestConnectionAttack === null || connection.asset.attack < $smallestConnectionAttack)
                    ) {
                        $smallestConnectionAttack = connection.asset.attack;
                        $newMove = {
                            selectedHexagon: cell.asset,
                            targetHexagon: connection.asset,
                            diff: (cell.asset.attack - connection.asset.attack)
                        };
                    }
                });
                if ($newMove !== null) {
                    possibleMoves.push($newMove);
                }
            }
        });

        //find best play
        let $bestMove = null;
        forEach(possibleMoves, function ($play) {
            if ($bestMove === null || $play.diff > $bestMove.diff) {
                $bestMove = $play;
            }
        });

        return $bestMove;
    }

    interact (targetHexagon) {
        if (this.isAI) {
            return false;
        }

        if (targetHexagon !== null) {
            if (targetHexagon.isOwnedBy(this.id)) {
                if (this.selectedHexagon == null && targetHexagon.isSelected() === false && targetHexagon.attack > 1) {
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

    capture (defender) {
        let attackerRoll = this.roll(this.selectedHexagon);
        let defenderRoll = this.roll(defender);

        if (attackerRoll > defenderRoll) {
            //Success
            this.game.hud.updateMessage(`${this.name} (${attackerRoll}) won an attack against ${defender.player.name} (${defenderRoll})`);
            this.absorb(defender);
            if (this.selectedHexagon.attack === 1) {
                this.selectedHexagon.unselect();
                this.clearSelection();
            }
            return true;
        } else {
            //Failure
            this.game.hud.updateMessage(`${this.name} (${attackerRoll}) failed an attack against ${defender.player.name} (${defenderRoll})`);
            this.selectedHexagon.attack = 1;
            this.selectedHexagon.updateAttackText();
            if (this.selectedHexagon.attack === 1) {
                this.selectedHexagon.unselect();
                this.clearSelection();
            }
            return false;
        }
    }

    absorb (absorbedHexagon) {
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

    roll (hexagon) {
        let $roll = 0;
        let $n = 0;

        while ($n < hexagon.attack) {
            $roll += random(1, 6);
            $n++;
        }
        return $roll;
    }

    clearSelection () {
        if (this.selectedHexagon !== null) {
            this.selectedHexagon.unselect();
            this.selectedHexagon = null;
        }
    }

    endTurn () {
        this.callback();
    }
}
