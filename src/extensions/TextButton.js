import Phaser from 'phaser';

export default class TextButton extends Phaser.Button {
    constructor ({game, x, y, asset, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, label, style, tint}) {
        super(game, x, y, asset, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);

        this.anchor.setTo(0.5);

        this.label = label;
        this.style = style;
        this.tint = tint;
        this.text = new Phaser.Text(this.game, 0, 0, this.label, this.style);
        this.text.anchor.setTo(0.5);

        this.addChild(this.text);
    }
}
