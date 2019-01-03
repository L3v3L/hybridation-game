import Phaser from 'phaser';
import TextButton from '../extensions/TextButton';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        let backBtn = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: this.game.world.height - 60,
            asset: 'greySheet',
            callback: this.startMenuState,
            callbackContext: this,
            overFrame: 'button0',
            outFrame: 'button0',
            downFrame: 'button0',
            upFrame: 'button0',
            tint: Phaser.Color.GREEN,
            label: 'back',
            style: {
                font: '19px KenVector Future Thin',
                fill: 'white',
                align: 'center'
            },
            textX: -1,
            textY: 0
        });
        backBtn.anchor.setTo(0.5);
        this.game.add.existing(backBtn);
    }

    render () {
    }

    startMenuState () {
        this.state.start('StartMenu');
    }
}
