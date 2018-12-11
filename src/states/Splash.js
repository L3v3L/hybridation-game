import Phaser from 'phaser';
import { centerGameObjects } from '../utils';

export default class extends Phaser.State {
    init () {
    }

    preload () {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        centerGameObjects([this.loaderBg, this.loaderBar]);

        this.load.setPreloadSprite(this.loaderBar);
        //load assets
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('hexagon', 'assets/images/hexagon.png');
        this.load.atlasJSONArray('button', 'assets/images/button.png', 'assets/data/button.json');
        this.load.atlasJSONArray('greySheet', 'assets/images/greySheet.png', 'assets/data/greySheet.json');
    }

    create () {
        if (process.env.DEBUG === 'true' && process.env.DEBUG_SKIP_START_MENU === 'true') {
            this.state.start('Battle');
        } else {
            this.state.start('StartMenu');
        }
    }
}
