import Phaser from 'phaser';

export default class extends Phaser.Sprite {
    constructor ({game, x, y, asset, name, width, height, arrayMap, player, state, attack}) {
        super(game, x, y, asset);
        this.anchor.setTo(0.5);
        this.inputEnabled = true;
        this.events.onInputDown.add(this.mclick, this);
        this.custName = name;
        this.width = width;
        this.height = height;
        this.arrayMap = arrayMap;
        this.player = player;
        this.tint = player.tint;
        this.state = state;
        this.attack = attack;
    }

    update () {
    }

    mclick () {
        //check if player action enabled
        if (this.game.global.PLAYER_ENABLED) {
            if (this.player.id === 1) {
                if (this.game.global.SELECTED_CELL != null) {
                    this.game.global.SELECTED_CELL.asset.tint = this.game.global.SELECTED_CELL.asset.player.tint;
                }
                this.game.global.SELECTED_CELL = this.arrayMap;
                this.tint = Phaser.Color.RED;
            } else if (this.game.global.SELECTED_CELL != null && this.game.global.SELECTED_CELL.asset.player.id === 1) { //attack triggered

                let attacker = this.game.global.SELECTED_CELL.asset;
                let defender = this;

                //TODO display result of attack
                if (attacker.generateAttack() > defender.generateAttack()) {
                    defender.player = attacker.player;
                    defender.tint = attacker.player.tint;
                    defender.attack = attacker.attack - 1;
                    attacker.attack = 1;
                } else {
                    attacker.attack = 1;
                }
                console.log(`${attacker.lastAttack} -> ${defender.lastAttack}`);
            }
        }
    }

    generateAttack () {
        this.lastAttack = (Math.floor(Math.random() * this.attack) + 1);
        return this.lastAttack;
    }
}
