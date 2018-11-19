import Phaser from 'phaser';

export default class Hud extends Phaser.Group {
    constructor ({game, player}) {
        super(game);
        this.game = game;
        this.player = player;
        this.width = 800;
        this.messageLabel = '> ';
        this.message = new Phaser.Text(this.game, 5, 5, this.messageLabel, {
            font: '13px Verdana',
            fill: 'black',
            align: 'center'
        });

        this.add(this.message);
    }

    updateMessage (message) {
        this.message.text = this.messageLabel + message;
    }
};
