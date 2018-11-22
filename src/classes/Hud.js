import Phaser from 'phaser';
import TextButton from '../extensions/TextButton';
import PlayerBadge from '../classes/PlayerBadge';
import { forEach } from 'lodash';

export default class Hud extends Phaser.Group {
    constructor ({game, player}) {
        super(game);
        this.game = game;
        this.currentPlayer = player;
        this.width = 800;

        this.messageLabel = '';
        this.message = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.height - 10, this.messageLabel, {
            font: '16px KenVector Future',
            fill: 'black',
            align: 'center'
        });
        this.message.anchor.setTo(0.5);

        this.playerBadges = [];
        for (let [index, value] of this.game.global.PLAYER_ARRAY.entries()) {
            this.playerBadges.push(new PlayerBadge({
                game: this.game,
                player: value,
                x: (index * 140) + 60,
                y: 20
            }));
        }
        //
        //for (let i = 0; i < this.game.global.NUMBER_OF_PLAYERS;  i++) {
        //    this.playerBadges.push(new PlayerBadge({
        //        game: this.game,
        //        player: this.game.global.PLAYER_ARRAY[i],
        //        x: (i * 140) + 60,
        //        y: 20
        //    }));
        //}

        this.endTurnButton = new TextButton({
            game: this.game,
            x: 120,
            y: 65,
            asset: 'greySheet',
            callback: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER].endTurn,
            callbackContext: this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER],
            overFrame: 'sliderRight',
            outFrame: 'sliderRight',
            downFrame: 'sliderRight',
            upFrame: 'sliderRight',
            tint: this.currentPlayer.tint,
            label: 'end',
            style: {
                font: '11px KenVector Future Thin',
                fill: 'white',
                align: 'center'
            },
            textX: -1,
            textY: 0
        });

        for (let $playerBadge of this.playerBadges) {
            this.add($playerBadge);
        }

        this.add(this.message);
    }

    updateMessage (message) {
        this.message.text = this.messageLabel + message;
    }

    updatePlayers () {
        this.currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];

        for (let [index, player] of this.game.global.PLAYER_ARRAY.entries()) {
            this.playerBadges[index].updateName(player.name);
            this.playerBadges[index].updateTerritory(player.territory);
            this.playerBadges[index].updateScore(player.score);

            if (index === this.game.global.CURRENT_PLAYER) {
                this.playerBadges[index].activate();
            } else {
                this.playerBadges[index].deactivate();
            }
        }
    }

    update () {
        this.updatePlayers();
        if (this.currentPlayer.isAI) {
            this.removeChild(this.endTurnButton);
        } else {
            this.addChild(this.endTurnButton);
        }
    }
};
