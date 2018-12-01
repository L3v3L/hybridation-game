import Phaser from 'phaser';

export default class extends Phaser.State {
    init () {
    }

    preload () {
    }

    create () {
        this.state.restart('Game');
    }

    render () {
    }
}
