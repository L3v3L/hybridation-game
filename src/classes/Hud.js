import Phaser from 'phaser';
import TextButton from '../extensions/TextButton';

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

        this.endTurnButton = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: 60,
            asset: 'button',
            callback: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER].endTurn,
            callbackContext: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER],
            overFrame: 2,
            outFrame: 1,
            downFrame: 0,
            upFrame: 1,
            tint: Phaser.Color.WHITE,
            label: 'End Turn',
            style: {
                font: '20px Arial',
                fontWeight: 'bold',
                fill: 'white',
                align: 'center'
            }
        });

        //this.add(this.endTurnButton);
        this.add(this.playerName);
        this.add(this.message);
    }

    updateMessage (message) {
        this.message.text = this.messageLabel + message;
    }

    updatePlayer () {
        this.player = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];

        this.playerName.setStyle({
            fill: Phaser.Color.getWebRGB(this.player.tint),
            stroke: 'black',
            strokeThickness: 4,
        });

        if (this.player.isAI) {
            this.removeChild(this.endTurnButton);
            this.message.y = 60;
        } else {
            this.addChild(this.endTurnButton);
            this.message.y = 100;
        }
    }

    update () {
        this.updatePlayer();
        this.playerName.text = this.player.name;
    }
};
