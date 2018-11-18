import Phaser from 'phaser';

export default class extends Phaser.Sprite {
    constructor ({game, x, y, asset, name, width, height, arrayMap}) {
        super(game, x, y, asset);
        this.anchor.setTo(0.5);
        this.inputEnabled = true;
        this.events.onInputDown.add(this.mclick, this);
        this.custName = name;
        this.width = width;
        this.height = height;
        this.arrayMap = arrayMap;
    }

    update () {
    }

    mclick () {
        //check if player action enabled
        if (this.game.global.PLAYER_ENABLED) {
            if (this.game.global.SELECTED_CELL != null) {
                this.game.global.SELECTED_CELL.asset.tint = Phaser.Color.WHITE;
            }
            this.game.global.SELECTED_CELL = this.arrayMap;
            this.tint = Phaser.Color.RED;
        }
    }
}
