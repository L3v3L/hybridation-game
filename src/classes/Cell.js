export default class {
    constructor (id, connectionCount) {
        this.id = id;
        //need to default connection limit
        this.connections = [];
        this.connectionCount = connectionCount;
        this.x = null;
        this.y = null;
        this.asset = null;
        this.clusterBelongs = null;
    }

    /**
     * set this cells corrdinates
     * @param positionArray
     */
    setPosition (positionArray) {
        this.x = positionArray[0];
        this.y = positionArray[1];
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
                return [this.x, this.y - 2];
            case 1:
                return [this.x + 1, this.y - 1];
            case 2:
                return [this.x + 1, this.y + 1];
            case 3:
                return [this.x, this.y + 2];
            case 4:
                return [this.x - 1, this.y + 1];
            case 5:
                return [this.x - 1, this.y - 1];
        }
    }

    /**
     * get an array of this cells coordinates
     * @returns {*}
     */
    getPosition () {
        if (this.x === null || this.y === null) {
            return null;
        }

        return [this.x, this.y];
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
}
