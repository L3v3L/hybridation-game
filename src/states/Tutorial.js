import Phaser from 'phaser';
import TextButton from '../extensions/TextButton';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        let titleText = 'Tutorial';
        let text = `The number on each hexagon represents its attack,
        the higher the attack the better chance it has in winning a battle.
        \nPress a hexagon you own, then press an opposing adjacent hexagon to attack.
        When the whole map is owned by one user, that user has won the game.`;

        let txtTitle = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.centerY - 100, titleText, {
            font: '19px KenVector Future',
            fill: '#000000'
        });
        txtTitle.anchor.setTo(0.5);
        this.game.add.existing(txtTitle);

        let txtDescription = new Phaser.Text(this.game, this.game.world.centerX, this.game.world.centerY - 50, text, {
            font: '15px KenVector Future',
            fill: '#000000',
            align: 'center'
        });
        txtDescription.anchor.setTo(0.5, 0);
        this.game.add.existing(txtDescription);

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
