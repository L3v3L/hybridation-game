import Phaser from 'phaser';
import { random, forEach } from 'lodash';

export default class extends Phaser.Group {
    constructor ({game, x, y, asset, name, width, height, arrayMap, player, state, attack}) {
        super(game, x, y, asset);
        this.game = game;

        this.hexagon = new Phaser.Sprite(this.game, x, y, asset);
        this.hexagon.anchor.setTo(0.5);
        this.hexagon.inputEnabled = true;
        this.hexagon.events.onInputDown.add(this.mclick, this);
        this.hexagon.tint = player.tint;
        this.custName = name;
        this.hexagon.width = width;
        this.hexagon.height = height;
        this.arrayMap = arrayMap;
        this.player = player;
        this.state = state;
        this.attack = attack;
        this.selected = false;
        this.attackText = new Phaser.Text(this.game, x + 2, y + 2, attack, {
            font: '8pt Consolas',
            fill: 'white',
            stroke: true,
            strokeWidth: 1,
            wordWrap: false,
            align: 'center'
        });
        this.attackText.smoothed = false;
        this.attackText.setShadow(1, 1, 'rgba(0,0,0,1)', 0);
        this.attackText.anchor.set(0.5);
        this.add(this.hexagon);
        this.add(this.attackText);
    }

    mclick () {
        let pos = this.arrayMap.getPosition();
        console.log(`${pos}`);
        if (this.isPlayerTurn()) {
            if (this.isEmptySelection()) {
                if (this.isSelectable()) {
                    this.select();
                }
            } else {
                if (this.isSelected()) {
                    this.unselect();
                } else if (this.isAttackable()) {
                    let attacker = this.getSelectedCell();
                    let defender = this;
                    this.battle(attacker, defender);
                }
            }
        }
    }

    battle (attacker, defender) {
        let success = this.attemptCapture(attacker, defender);

        if (success) {
            this.game.hud.updateMessage(`Player ${attacker.player.name} (${attacker.lastAttack}) won an attack against ${defender.player.name} (${defender.lastAttack}).`);
            attacker.unselect();
            defender.select();
        } else {
            this.game.hud.updateMessage(`Player ${attacker.player.name} (${attacker.lastAttack}) failed an attack against ${defender.player.name} (${defender.lastAttack}).`);
            attacker.unselect();
        }
    }

    attemptCapture (attacker, defender) {
        let success = attacker.generateAttack() > defender.generateAttack();

        if (success) {
            defender.absorbedBy(attacker);
        } else {
            attacker.resetAttack();
        }

        return success;
    }

    absorbedBy (attacker) {
        let defender = this;
        defender.player = attacker.player;
        defender.hexagon.tint = attacker.player.tint;
        defender.attack = attacker.attack - 1;
        this.updateAttackText();
        attacker.resetAttack();
        this.unselect();
    }

    resetAttack () {
        this.attack = 1;
        this.updateAttackText();
    }

    select () {
        this.selected = true;
        if (this.game.global.SELECTED_CELL != null) {
            this.game.global.SELECTED_CELL.asset.hexagon.tint = this.game.global.SELECTED_CELL.asset.player.tint;
            this.game.global.SELECTED_CELL.asset.unselect();
        }

        this.game.global.SELECTED_CELL = this.arrayMap;

        this.hexagon.tint = Phaser.Color.RED;
    }

    unselect () {
        this.selected = false;
        if (this.game.global.SELECTED_CELL != null) {
            this.game.global.SELECTED_CELL.asset.hexagon.tint = this.game.global.SELECTED_CELL.asset.player.tint;
            this.game.global.SELECTED_CELL = null;
        }
    }

    generateAttack () {
        this.lastAttack = random(1, this.attack);
        return this.lastAttack;
    }

    isPlayerTurn () {
        return this.game.global.PLAYER_ENABLED;
    }

    isEmptySelection () {
        return this.game.global.SELECTED_CELL == null;
    }

    isAdjacentTo (cell) {
        let cellFound = false;
        forEach(this.arrayMap.connections, function (value) {
            if (value.id === cell.id) {
                cellFound = true;
            }
        });
        return cellFound;
    }

    getSelectedCell () {
        if (this.game.global.SELECTED_CELL) {
            return this.game.global.SELECTED_CELL.asset;
        }
    }

    updateAttackText () {
        this.attackText.text = this.attack;
    }

    isSelected () {
        return this.selected;
    }

    isSelectable () {
        return this.player.id === 0 && this.isSelected() === false;
    }

    isAttackable () {
        return !this.isEmptySelection() &&
            this.game.global.SELECTED_CELL.asset.player.id === 0 &&
            this.player.id !== 0 &&
            this.isAdjacentTo(this.game.global.SELECTED_CELL);
    }
}
