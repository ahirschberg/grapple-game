
class Actor extends Sprite {

    constructor(x, y, width, height, srcImage) {
        super(x, y, width, height, srcImage);
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.topSpeed = 0;
        this.xAcceleration = 0;
        this.yAcceleration = 0;
        this.bounceCoefficient = 1;
        this.frictionCoefficient = 0;
        this.animationTimer = 0;
        this.animationFrameDuration = 20;
        this.animationFrames = [srcImage];
    }

    act(level) {
        // Abstract method; do not fill in. This method should be overridden in child classes.
    }

    updatePosition() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    updateVelocity() {
        this.xVelocity += this.xAcceleration;
        this.yVelocity += this.yAcceleration;
    }

    getAccelerationMagnitude() {
        return Math.sqrt(Math.pow(this.xAcceleration, 2) + Math.pow(this.yAcceleration, 2));
    }

    getAccelerationRadians() {
        return Math.atan2(this.yAcceleration, this.xAcceleration);
    }

    getVelocity() {
        return Math.sqrt(Math.pow(this.xVelocity, 2) + Math.pow(this.yVelocity, 2));
    }

    getVelocityRadians() {
        return Math.atan2(this.yVelocity, this.xVelocity);
    }

    isMovingUp() {
        return this.yVelocity < 0;
    }

    isMovingDown() {
        return this.yVelocity > 0;
    }

    isMovingLeft(speed = 0) {
        return this.xVelocity < speed;
    }

    isMovingRight(speed = 0) {
        return this.xVelocity > speed;
    }

    // rotates between images in this.animationFrames after this.animationFrameDuration milliseconds.
    animate() {
        if (this.animationFrames.length > 1) {
            this.animationTimer += 1;
            const quotient = Math.floor(this.animationTimer / this.animationFrameDuration)
            const frame = quotient % this.animationFrames.length;
            this.srcImage = this.animationFrames[frame];
            if (this.animationTimer === this.animationFrameDuration * this.animationFrames.length) {
                this.animationTimer = 0;
            }
        }
    }

    handleCollisionsWithSolids(level, ignoreFriction = false) {
        for (let solid of level.getPossibleSolidCollisions(this)) {
            if (this.isCollidingWith(solid)) {
                if (this.isHurt) {
                    this.die(level);
                }
                this.bounceOffSolid(solid);
                if (!ignoreFriction) {
                    this.applyFriction(solid);
                }
            }
        }
    }

    bounceOffSolid(solid) {
        // Move actor out of solid
        this.x += this.minTranslationX;
        this.y += this.minTranslationY;
        // bounce this off of solid
        const magnitude = this.getTranslationVectorMagnitude();
        if (this.minTranslationX === 0 || this.minTranslationY === 0) {
            if (this.minTranslationX !== 0 && Math.sign(this.minTranslationX) !== Math.sign(this.xVelocity)) {
                this.xVelocity *= -1 * Math.abs(this.minTranslationX / magnitude) * solid.bounceCoefficient * this.bounceCoefficient;
            }
            else if (this.minTranslationY !== 0 && Math.sign(this.minTranslationY) !== Math.sign(this.yVelocity)) {
                this.yVelocity *= -1 * Math.abs(this.minTranslationY / magnitude) * solid.bounceCoefficient * this.bounceCoefficient;
            }
        }
        else {
            // gotta do some fuckin axis rotation >_>

            const angle = MathUtil.calculateTheta(this.minTranslationY, this.minTranslationX);
            let polar = MathUtil.cartesianToPolar(this.xVelocity, this.yVelocity);
            polar.theta += angle;
            let transformed = MathUtil.polarToCartesian(polar.r, polar.theta);
            transformed.x *= -1;
            polar = MathUtil.cartesianToPolar(transformed.x, transformed.y);
            polar.theta -= angle;
            transformed = MathUtil.polarToCartesian(polar.r, polar.theta);

            this.xVelocity = Math.abs(transformed.x) * Math.sign(this.minTranslationX) * this.bounceCoefficient * solid.bounceCoefficient;
            this.yVelocity = Math.abs(transformed.y) * Math.sign(this.minTranslationY) * this.bounceCoefficient * solid.bounceCoefficient;
        }
    }

    applyFriction(solid) {
        this.xVelocity *= (1 - solid.frictionCoefficient) * (1 - this.frictionCoefficient);
        this.yVelocity *= (1 - solid.frictionCoefficient) * (1 - this.frictionCoefficient);
    }

    die(level) {
        // nothing here. needs to be overridden by child classes
    }

}