// state enum
const GrappleState = {
    EXTENDING: 1,
    ATTACHED: 2,
    RETURNING: 3,
    RETURNED: 4
}

class Grapple extends Actor {
    constructor(player, targetX, targetY, length) {
        super(player.getCenterX(), player.getCenterY(), 50, 80, "claw");
        this.hitboxes = [new Hitbox(this, 15, 25, 20, 20)];
        this.x -= this.width / 2;
        this.y -= this.height / 2;
        this.player = player;
        this.state = GrappleState.EXTENDING;
        this.length = length;
        this.extendSpeedFactor = 0.07;
        this.returnAcceleration = 2;
        this.returningSpeed = 0;
        this.calculateEndpoint(targetX, targetY);
        this.rotation = this.calculateRotation(targetX,targetY, player.x, player.y);
    }

    act() {
        if (!this.player.controller.mouseDown && (this.state === GrappleState.EXTENDING || this.state === GrappleState.ATTACHED)) {
            this.return();
        }
        else if (this.state === GrappleState.RETURNING) {
            this.returnToPlayer();
        }
        // check for collisions to attach to
        else if (this.state === GrappleState.EXTENDING) {
            let solid;
            for (solid of this.level.getPossibleSolidCollisions()) {
                if (this.isCollidingWith(solid)) {
                    this.attach();
                }
            }
        }
        // if no collisions, keep extending
        if (this.state === GrappleState.EXTENDING) {
            this.extend();
        }
    }

    calculateEndpoint(targetX, targetY) {
        const diffX = targetX - this.getCenterX();
        const diffY = targetY - this.getCenterY();
        const mag = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        this.endX = this.x + ((diffX / mag) * this.length);
        this.endY = this.y + ((diffY / mag) * this.length);
    }

    attach() {
        this.state = GrappleState.ATTACHED;
        this.player.srcImage = "playerSpriteGrappled";
    }

    extend() {
        const diffX = this.endX - this.x;
        const diffY = this.endY - this.y;
        const mag = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        if (mag < 60) {
            this.return();
        }
        else {
            this.xVelocity = this.extendSpeedFactor * diffX;
            this.yVelocity = this.extendSpeedFactor * diffY;
            this.updatePosition();
        }
    }

    return() {
        this.state = GrappleState.RETURNING;
        this.player.srcImage = "playerSprite";
    }

    /**
     * Change names/vars to whatever you want
     * Takes the arctan of the difference between two vectors.
     * Returns an angle from two vectors in radians
     * Shifted by PI/2 because of the starting place of the image.
     * The image was saved upright. Starting from 0 radians would cause it to rotate incorrectly
     * This is only called once during the instantiation of the grapple.
     * @vectorOneX the x direction of the first vector
     * @vectorOneY the y direction of the first vector
     * @vectorTwoX the x direction of the second vector
     * @vectorTwoY the y direction of the second vector
    */
    calculateRotation(vectorOneX, vectorOneY, vectorTwoX, vectorTwoY) { 
        return Math.atan2(vectorTwoY - vectorOneY, vectorTwoX - vectorOneX) + (Math.PI/2);
    }
    
    returnToPlayer() {
        const diffX = this.player.getCenterX() - this.getCenterX();
        const diffY = this.player.getCenterY() - this.getCenterY();
        const mag = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        if (mag < 30) {
            this.state = GrappleState.RETURNED;
        }
        else {
            this.returningSpeed += this.returnAcceleration;
            if (Math.abs((diffX / mag) * this.returningSpeed) < Math.abs(diffX)) {
                this.x += (diffX / mag) * this.returningSpeed;
            }
            else {
                this.x += diffX;
            }
            if (Math.abs((diffY / mag) * this.returningSpeed) < Math.abs(diffY)) {
                this.y += (diffY / mag) * this.returningSpeed;
            }
            else {
                this.y += diffY;
            }
        }
    }
}

