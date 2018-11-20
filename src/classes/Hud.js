import Phaser from 'phaser';

export default class Hud extends Phaser.Group {
    constructor ({game, player}) {
        super(game);
        this.game = game;
        this.player = player;
        this.width = 800;

        this.messageLabel = '';
        this.message = new Phaser.Text(this.game, this.game.world.centerX, 100, this.messageLabel, {
            font: '10pt Verdana',
            fill: 'black',
            align: 'center'
        });
        this.message.anchor.setTo(0.5);

        this.playerName = new Phaser.Text(this.game, this.game.world.centerX, 25, this.player.name, {
            font: '20pt Sans',
            fontWeight: 'bold',
            stroke: 'black',
            strokeThickness: 4,
            fill: 'white',
            align: 'center'
        });
        this.playerName.anchor.setTo(0.5);

        this.add(this.message);
        this.add(this.playerName);
    }

    updateMessage (message) {
        this.message.text = this.messageLabel + message;
    }

    updatePlayer () {
        this.player = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
    }

    update () {
        this.updatePlayer();
        this.playerName.text = this.player.name;
    }
};
