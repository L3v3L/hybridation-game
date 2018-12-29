import Phaser from 'phaser';
import color from 'color';

export default class extends Phaser.Group {
    constructor ({game, x, y, asset, width, height, player, state, attack, id, connectionCount}) {
        super(game, x, y, asset);
        this.id = id;
        //need to default connection limit
        this.connections = [];
        this.connectionCount = connectionCount;
        this.cellX = null;
        this.cellY = null;
        this.clusterBelongs = null;
        this.game = game;
        this.player = player;
        this.state = state;
        this.attack = attack;
        this.selected = false;

        this.hexagon = new Phaser.Sprite(this.game, x, y, asset);
        this.hexagon.anchor.setTo(0.5);
        this.hexagon.inputEnabled = true;
        this.hexagon.events.onInputDown.add(this.mclick, this);
        this.hexagon.tint = this.getTint();
        this.hexagon.width = width;
        this.hexagon.height = height;
        this.add(this.hexagon);

        if (this.game.global.SHOW_CELL_IDS) {
            this.labelText = this.id;
        } else {
            this.labelText = attack;
        }

        this.attackText = new Phaser.Text(this.game, x + 2, y + 2, this.labelText, {
            font: '18px KenVector Future ',
            fill: 'black',
            stroke: false,
            strokeWidth: 1,
            wordWrap: false,
            align: 'center'
        });
        this.attackText.smoothed = false;
        this.attackText.setShadow(1, 1, 'rgba(0,0,0,1)', 0);
        this.attackText.anchor.set(0.5);
        this.add(this.attackText);
    }

    /**
     *
     */
    getTint () {
        let minPercentage = 0.5;
        let range = 1 - minPercentage;
        let attackPercentage = ((this.attack * 100) / this.game.global.MAX_ATTACK) / 100;
        let inRangePercentage = (attackPercentage * range);
        let tint = color(this.player.tint).lighten(1 - (minPercentage + inRangePercentage)).rgbNumber();
        return tint;
    }

    /**
     *
     */
    mclick () {
        if (process.env.DEBUG === 'true' && process.env.DEBUG_SKIP_START_MENU === 'true') {
            window.debugHelper.selectOutput(this);
        }

        let currentPlayer = this.game.global.PLAYER_ARRAY[this.game.global.CURRENT_PLAYER];
        currentPlayer.interact(this);
    }

    /**
     *
     */
    select () {
        this.selected = true;
        this.hexagon.tint = Phaser.Color.RED;
        return this;
    }

    /**
     *
     */
    unselect () {
        this.selected = false;
        this.hexagon.tint = this.getTint();
    }

    /**
     *
     */
    updateAttackText () {
        if (this.game.global.SHOW_CELL_IDS) {
            this.attackText.text = this.id;
        } else {
            this.attackText.text = this.attack;
        }
    }

    /**
     *
     */
    isSelected () {
        return this.selected;
    }

    /**
     *
     * @param {*} playerId
     */
    isOwnedBy (playerId) {
        return playerId === this.player.id;
    }

    /**
     *
     */
    increaseAttack () {
        this.attack = this.attack + 1;
        this.hexagon.tint = this.getTint();
        this.updateAttackText();
    }

    /**
     *
     * @param {*} onlyPlayer
     */
    getConnectionsByPlayer (onlyPlayer = null) {
        let possibleMoves = this.connections.filter(function (cell) {
            if (onlyPlayer) {
                return (typeof cell === 'object' && cell.player.id === onlyPlayer.id);
            } else {
                return (typeof cell === 'object' && cell.player.id !== this.player.id);
            }
        }, this);
        return possibleMoves;
    }

    /**
     *
     */
    scoreMoves () {
        let possibleMoves = this.getConnectionsByPlayer();

        //score diff
        possibleMoves = possibleMoves.map(function (cell) {
            cell.movePoints = this.attack - cell.attack;
            return cell;
        }, this);

        //score messing chains
        possibleMoves = possibleMoves.map(function (cell) {
            //check how big chain cell is part of
            cell.chainPoints = cell.clusterBelongs.length;
            return cell;
        }, this);

        //score connecting to chains
        possibleMoves = possibleMoves.map(function (cell) {
            //find all connecting cells that are the attackers same player
            //exclude attacking hexagon
            //exclude attacking cluster siblings
            //store an increment of chainPoints from found cells in victim cell
            cell.friendsPoints = 0;

            //get all friends connected to enemy
            let friends = cell.getConnectionsByPlayer(this.player);

            if (friends.length > 0) {
                //filter out unwanted friends
                friends = friends.filter(function (friendCell) {
                    //is friend me, is friend in my cluster
                    return (friendCell.id !== this.id &&
                        friendCell.clusterBelongs.filter(function (cell2) {
                            return cell2.id === this.id;
                        }, this).length === 0);
                }, this);

                if (friends.length > 0) {
                    cell.friendsPoints = friends.reduce(function (total, currentCell) {
                        return total + currentCell.clusterBelongs.length;
                    }, 0);
                }
            }

            return cell;
        }, this);

        //sum up points
        possibleMoves = possibleMoves.map(function (cell) {
            cell.totalPoints = (cell.movePoints * this.game.global.MOVE_POINTS_WEIGHT) + (cell.friendsPoints * this.game.global.FRIEND_POINTS_WEIGHT) + (cell.chainPoints * this.game.global.CHAIN_POINTS_WEIGHT);
            return cell;
        }, this);

        return possibleMoves;
    }

    /**
     * set this cells corrdinates
     * @param positionArray
     */
    setPosition (positionArray) {
        this.cellX = positionArray[0];
        this.cellY = positionArray[1];
    }

    /**
     * check if all connections on this cell full
     * @returns {boolean}
     */
    isFull () {
        for (let i = 0; i < this.connectionCount; i++) {
            if (typeof this.connections[i] !== 'object') {
                return false;
            }
        }
        return true;
    }

    /**
     * get an array of the coordinates connected in a certain direction
     * @param direction
     * @returns {*[]}
     */
    getNextPosition (direction) {
        direction = this.limPos(direction);
        switch (direction) {
            case 0:
                return [this.cellX, this.cellY - 2];
            case 1:
                return [this.cellX + 1, this.cellY - 1];
            case 2:
                return [this.cellX + 1, this.cellY + 1];
            case 3:
                return [this.cellX, this.cellY + 2];
            case 4:
                return [this.cellX - 1, this.cellY + 1];
            case 5:
                return [this.cellX - 1, this.cellY - 1];
        }
    }

    /**
     * get an array of this cells coordinates
     * @returns {*}
     */
    getPosition () {
        if (this.cellX === null || this.cellY === null) {
            return null;
        }

        return [this.cellX, this.cellY];
    }

    /**
     * connect a cell to this cell
     * @param cell
     * @param direction
     */
    connectNode (cell, direction) {
        direction = this.limPos(direction);

        if (typeof cell === 'undefined') {
            return;
        }

        let oppositeDirection = this.opposite(direction);

        if (typeof this.connections[direction] === 'undefined') {
            this.connections[direction] = cell;
        }

        if (typeof cell.connections[oppositeDirection] === 'undefined') {
            cell.connections[oppositeDirection] = this;
        }

        this.leftRightConnect(direction, cell);
    }

    /**
     * connect cells left and right to the parent connecting cell
     * @param direction
     * @param cell
     */
    leftRightConnect (direction, cell) {
        let oppositeDirection = this.opposite(direction);
        //connect existing adjacent cells to new cell
        let leftCell = this.connections[this.limPos(direction - 1)];
        let rightCell = this.connections[this.limPos(direction + 1)];

        if (typeof leftCell !== 'undefined' && typeof cell.connections[cell.limPos(oppositeDirection + 1)] === 'undefined') {
            cell.connectNode(leftCell, cell.limPos(oppositeDirection + 1));
        }

        if (typeof rightCell !== 'undefined' && typeof cell.connections[cell.limPos(oppositeDirection - 1)] === 'undefined') {
            cell.connectNode(rightCell, cell.limPos(oppositeDirection - 1));
        }
    }

    /**
     * find the opposite connection position
     * @param pos
     * @returns {*}
     */
    opposite (pos) {
        return this.limPos(pos + (this.connectionCount / 2));
    }

    /**
     * Modulate position into limit of connections
     * @param pos
     * @returns {number}
     */
    limPos (pos) {
        return ((pos % this.connectionCount) + this.connectionCount) % this.connectionCount;
    }

    /**
     * find first open connection
     * @param {*} empty
     * @param {*} clockwise
     */
    findFirst (empty, clockwise) {
        let typeToFind = empty ? 'undefined' : 'object';

        //todo find way to refract this
        if (clockwise) {
            for (let i = 0; i < this.connectionCount; i++) {
                if (typeof this.connections[i] === typeToFind) {
                    return this.limPos(i);
                }
            }
        } else {
            for (let i = this.connectionCount; i >= 0; i--) {
                if (typeof this.connections[i] === typeToFind) {
                    return this.limPos(i);
                }
            }
        }
        return -1;
    }

    /**
     *
     * @param {*} cell
     */
    isAdjacentTo (cell) {
        return this.connections.find(function (connectionCell) {
            return (typeof connectionCell === 'object' && connectionCell.id === cell.id);
        }, cell);
    }

    /**
     *
     * @param {*} arrayOfCells
     */
    isCellConnectedToAnyInCellArray (arrayOfCells) {
        return arrayOfCells.find(function (cell) {
            return cell.isAdjacentTo(this);
        }, this);
    }
}
