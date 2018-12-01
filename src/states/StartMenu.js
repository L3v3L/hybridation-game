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
            label: 'Cure Virus',
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

        let $titleTxt = new Phaser.Text(this.game, this.game.world.centerX, 100, 'Hybridation', {
            font: '30px KenVector Future',
            fill: '#000000'
        });
        $titleTxt.anchor.setTo(0.5);
        this.game.add.existing($titleTxt);

        let $description = `
        Humanity is being infected by the Hybridation virus\n stop the virus, save the world.
        `;

        let $DescriptionTxt = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.centerY - 100, $description, {
            font: '19px KenVector Future', fill: '#000000', align: 'center',
            boundsAlignH: "center",
            boundsAlignV: "middle"
        });
        $DescriptionTxt.anchor.setTo(0.5);
        this.game.add.existing($DescriptionTxt);

    }

    render () {
    }

    restartGame () {
        this.state.start('Game');
    }
}