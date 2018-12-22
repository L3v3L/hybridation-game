import Phaser from 'phaser';
import color from 'color';

export default class BattleBar extends Phaser.Group {
    constructor ({game}) {
        super(game);
        this.game = game;

        this.battleBarBackground = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.height - 40, 'greySheet', 'button1');

        this.battleBarBackground.width = 410;

        this.battleBarBackground.anchor.setTo(0.5);

        this.add(this.battleBarBackground);

        this.defenderBar = new Phaser.Graphics(this.game, this.game.world.centerX, this.game.world.height - 60);
        this.defenderBar.beginFill(Phaser.Color.WHITE);
        this.defenderBar.drawRect(0, 0, 400, 37);
        this.defenderBar.endFill();
        this.defenderBar.tint = Phaser.Color.GREEN;
        this.defenderBar.width = 400;
        this.defenderBar.x = this.game.world.centerX - 200;

        this.attackerBar = new Phaser.Graphics(this.game, this.game.world.centerX, this.game.world.height - 60);
        this.attackerBar.beginFill(Phaser.Color.WHITE);
        this.attackerBar.drawRect(0, 0, 400, 37);
        this.attackerBar.endFill();
        this.attackerBar.tint = Phaser.Color.RED;
        this.attackerBar.width = 400;
        this.attackerBar.x = this.game.world.centerX - 200;

        this.attackerBar.visible = false;
        this.defenderBar.visible = false;

        this.add(this.defenderBar);
        this.add(this.attackerBar);
    }

    setBarRatio (ratio) {
        this.attackerBar.width = 400 * ratio;

        this.attackerBar.tint = color(this.attackerBar.tint).lighten(1 - (ratio + 0.2)).rgbNumber();
        this.defenderBar.tint = color(this.defenderBar.tint).lighten((ratio - 0.2)).rgbNumber();

        if (ratio > 0.5) {
            this.battleBarBackground.tint = this.attackerBar.tint;
        } else {
            this.battleBarBackground.tint = this.defenderBar.tint;
        }
    }

    setColors (attackerColor, defenderColor) {
        this.attackerBar.tint = attackerColor;
        this.defenderBar.tint = defenderColor;
    }

    hideResults () {
        this.attackerBar.visible = false;
        this.defenderBar.visible = false;
    }

    showResuls () {
        this.attackerBar.visible = true;
        this.defenderBar.visible = true;
    }
};
