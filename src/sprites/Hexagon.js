import Phaser from 'phaser';
import {forEach} from 'lodash';

export default class extends Phaser.Group {
    constructor ({game, x, y, asset, width, height, cell, player, state, attack}) {
        super(game, x, y, asset);
        this.game = game;

        this.hexagon = new Phaser.Sprite(this.game, x, y, asset);
        this.hexagon.anchor.setTo(0.5);
        this.hexagon.inputEnabled = true;
        this.hexagon.events.onInputDown.add(this.mclick, this);
        this.hexagon.tint = player.tint;
        this.hexagon.width = width;
        this.hexagon.height = height;

        this.cell = cell;
        this.player = player;
        this.state = state;
        this.attack = attack;
        this.selected = false;
        this.attackText = new Phaser.Text(this.game, x + 2, y + 2, attack, {
            font: '18px KenVector Future ',
            fill: 'black',
            stroke: false,
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
        let currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
        currentPlayer.interact(this);
    }

    select () {
        this.selected = true;
        this.hexagon.tint = Phaser.Color.RED;
        return this;
    }

    unselect () {
        this.selected = false;
        this.hexagon.tint = this.player.tint;
    }

    isAdjacentTo (hexagon) {
        let cellFound = false;
        forEach(this.cell.connections, function (connectionCell) {
            if (typeof connectionCell === 'object' && connectionCell.id === hexagon.cell.id) {
                cellFound = true;
                return false;
            }
        });
        return cellFound;
    }

    updateAttackText () {
        this.attackText.text = this.attack;
    }

    isSelected () {
        return this.selected;
    }

    isOwnedBy (playerId) {
        return playerId === this.player.id;
    }
}
