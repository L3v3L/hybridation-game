import Phaser from 'phaser';
import TextButton from '../extensions/TextButton';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {

        let $restartBtn = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: this.game.world.centerY,
            asset: 'greySheet',
            callback: this.restartGame,
            callbackContext: this,
            overFrame: 'button0',
            outFrame: 'button0',
            downFrame: 'button0',
            upFrame: 'button0',
            tint: Phaser.Color.VIOLET,
            label: 'Restart',
            style: {
                font: '19px KenVector Future Thin',
                fill: 'white',
                align: 'center'
            },
            textX: -1,
            textY: 0
        });
        $restartBtn.anchor.setTo(0.5);
        this.game.add.existing($restartBtn);

        let $gameOverTxtTitle = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.centerY-100, 'Gameover', {font: '19px KenVector Future', fill: '#000000'});
        $gameOverTxtTitle.anchor.setTo(0.5);
        this.game.add.existing($gameOverTxtTitle);

        let $winnerTxt = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.centerY-50, 'Winner '+this.game.global.PLAYERS_IN_GAME[0].name, {font: '19px KenVector Future', fill: '#000000'});
        $winnerTxt.anchor.setTo(0.5);
        this.game.add.existing($winnerTxt);
    }

    render () {
    }

    restartGame () {
        this.state.start('Game');
    }
}
