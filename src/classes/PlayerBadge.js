import Phaser from 'phaser';

export default class PlayerBadge extends Phaser.Group {
    constructor ({game, player, x, y}) {
        super(game);

        this.game = game;
        this.x = x;
        this.y = y;

        this.player = player;

        this.colorBigText = {
            font: '16px KenVector Future',
            fill: Phaser.Color.getWebRGB(this.player.tint),
            align: 'right'
        };

        this.whiteBigText = {
            font: '16px KenVector Future',
            fill: 'white',
            align: 'right'
        };

        this.greySmallText = {
            font: '12px KenVector Future',
            fill: 'grey',
            align: 'right'
        };

        this.whiteSmallText = {
            font: '12px KenVector Future',
            fill: 'white',
            align: 'right'
        };

        this.bgActive = new Phaser.Sprite(this.game, x, y, 'greySheet', 'button1');
        this.bgActive.tint = this.player.tint;
        this.bgActive.anchor.setTo(0.5);

        this.bgInactive = new Phaser.Sprite(this.game, x, y, 'greySheet', 'button2');
        this.bgInactive.anchor.setTo(0.5);

        this.playerNameObj = new Phaser.Text(this.game, x, y, this.playerName, this.colorBigText);
        this.playerNameObj.setShadow(2, 2, 'black');
        this.playerNameObj.anchor.setTo(0.5);

        let percentOwned = this.player.getTerritory() / (this.game.global.WORLD_WIDTH * this.game.global.WORLD_HEIGHT) * 100;
        this.playerTerritoryObj = new Phaser.Text(this.game, x + 85, y - 17, percentOwned.toFixed(0) + '%', this.greySmallText);
        this.playerTerritoryObj.anchor.setTo(1, 0);

        this.playerScoreObj = new Phaser.Text(this.game, x + 85, y + 2, this.playerScore, this.greySmallText);
        this.playerScoreObj.anchor.setTo(1, 0);

        this.add(this.bgInactive);
        this.add(this.bgActive);
        this.bgActive.exists = false;

        this.add(this.playerNameObj);
        this.add(this.playerTerritoryObj);
        this.add(this.playerScoreObj);
    }

    update () {
        this.playerNameObj.text = this.player.name;
        this.playerTerritoryObj.text = this.player.getTerritory();
        this.playerScore.text = this.player.score;
    }

    updateScore () {
        this.playerScoreObj.text = this.player.score;
    }

    updateTerritory () {
        let percentOwned = this.player.getTerritory() / (this.game.global.WORLD_WIDTH * this.game.global.WORLD_HEIGHT) * 100;
        this.playerTerritoryObj.text = percentOwned.toFixed(0) + '%';
    }

    updateName () {
        this.playerNameObj.text = this.player.name;
    }

    activate () {
        this.bgActive.exists = true;
        this.bgInactive.exists = false;
        this.playerNameObj.setStyle(this.whiteBigText);
        this.playerNameObj.setShadow(2, 2, 'black');
        this.playerTerritoryObj.setStyle(this.whiteSmallText);
        this.playerScoreObj.setStyle(this.whiteSmallText);
    }

    deactivate () {
        this.bgActive.exists = false;
        this.bgInactive.exists = true;
        this.playerNameObj.setStyle(this.colorBigText);
        this.playerNameObj.setShadow(2, 2, 'black');
        this.playerTerritoryObj.setStyle(this.greySmallText);
        this.playerScoreObj.setStyle(this.greySmallText);
    }

    hide () {
        this.visible = false;
    }
};
