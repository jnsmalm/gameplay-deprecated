/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/
"use strict";
const $ = require("../../lib/lib");
const animation_1 = require("./animation");
const coin_1 = require("./coin");
const platform_1 = require("./platform");
const content_1 = require("./content");
var Movement;
(function (Movement) {
    Movement.left = new $.Vector3(-0.1, 0, 0);
    Movement.right = new $.Vector3(0.1, 0, 0);
    Movement.jump = new $.Vector3(0, 19, 0);
})(Movement || (Movement = {}));
/** Controls player movement and which animation to play. */
class PlayerController {
    constructor(animator, rigidBody) {
        this.animator = animator;
        this.rigidBody = rigidBody;
        this.jumpCount = 0;
        this.jumpSound = new SoundSource(content_1.Content.SoundBuffers.jump);
    }
    attach(transform) {
        this.transform = transform;
    }
    jump() {
        if (this.jumpCount >= 2) {
            // Can only jump twice in a row before landing.
            return;
        }
        this.jumpCount++;
        this.jumpSound.play();
        // Reset current velocity before adding new velocity.
        this.rigidBody.velocity.y = 0;
        this.rigidBody.addImpulse(Movement.jump);
    }
    moveLeft() {
        this.transform.move(Movement.left);
        this.animator.animate("left");
    }
    moveRight() {
        this.transform.move(Movement.right);
        this.animator.animate("right");
    }
    update(elapsedTime) {
        this.animator.animate("idle");
        if ($.Game.keyboard.isKeyDown($.KeyCode.leftArrow)) {
            this.moveLeft();
        }
        if ($.Game.keyboard.isKeyDown($.KeyCode.rightArrow)) {
            this.moveRight();
        }
        if ($.Game.keyboard.isKeyPress($.KeyCode.space)) {
            this.jump();
        }
        if (this.rigidBody.velocity.y > 0) {
            this.animator.animate("jump");
        }
        if (this.rigidBody.velocity.y < 0) {
            this.animator.animate("fall");
        }
    }
}
/** Animates the player. */
class PlayerAnimator {
    constructor(sprite) {
        this.sprite = sprite;
        this.walk = new animation_1.SpriteAnimation(content_1.Content.SpriteSheets.walk, undefined, 7, true);
        this.idle = new animation_1.SpriteAnimation(content_1.Content.SpriteSheets.idle, undefined, 7, true);
        this.jump = new animation_1.SpriteAnimation(content_1.Content.SpriteSheets.jump, ["2"], 7, false);
        this.fall = new animation_1.SpriteAnimation(content_1.Content.SpriteSheets.jump, ["7"], 7, false);
        this.anim = this.idle;
    }
    animate(animation) {
        switch (animation) {
            case "left": {
                this.sprite.transform.localScale.x = 1;
                this.anim = this.walk;
                break;
            }
            case "right": {
                this.sprite.transform.localScale.x = -1;
                this.anim = this.walk;
                break;
            }
            case "idle": {
                this.anim = this.idle;
                break;
            }
            case "jump": {
                this.anim = this.jump;
                break;
            }
            case "fall": {
                this.anim = this.fall;
                break;
            }
        }
    }
    update(elapsedTime) {
        this.anim.update(elapsedTime);
        this.anim.animate(this.sprite);
        this.sprite.origin = new $.Vector2(this.sprite.width / 2, this.sprite.height / 2);
    }
}
class Player extends $.Entity {
    constructor(context) {
        super();
        this.context = context;
        $.HotSwap.add(this, module);
    }
    init() {
        // Clear components before adding new ones.
        this.components.length = 0;
        // Rigid body is used for simple physics.
        this.rigidBody = new $.RigidBody(1, 0, 0);
        this.rigidBody.enableGravity = true;
        // Sprite representing the player visually.
        let sprite = this.addComponent(new $.Sprite(this.context.spriteBatch));
        sprite.pixelsPerUnit = 10;
        sprite.drawOrder = 4;
        // Control player movement and animation.
        let animator = this.addComponent(new PlayerAnimator(sprite));
        animator.animate("idle");
        this.controller = this.addComponent(new PlayerController(animator, this.rigidBody));
        this.addComponent(this.rigidBody);
        // Box collider for collision detection.
        this.collider = this.addComponent(new $.BoxCollider(new $.Vector3(0.4, 0.8, 1)));
    }
    /**
     * Handle collisions with coins and platforms.
     * @entity Coin or platform.
     * @mtv Minimum translation vector is the shortest distance that the
     * colliding object can be moved in order to no longer be colliding with
     * the other object.
     */
    handleCollision(entity, mtv) {
        if (entity instanceof coin_1.Coin) {
            entity.pickUp();
        }
        if (entity instanceof platform_1.Platform) {
            if (this.rigidBody.velocity.y > 0) {
                // Ignore collisions when player is jumping.
                return;
            }
            if (mtv.y <= 0 || mtv.y > 0.5) {
                // Ignore collisions with roof.
                return;
            }
            // Ignore x-axis when responding to collision.
            mtv.x = 0;
            $.RigidBody.handleCollision(this.rigidBody, entity.rigidBody, mtv);
            // Player has landed on a platform.
            this.controller.jumpCount = 0;
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFFWCxtQ0FBa0M7QUFDbEMsMkNBQTBEO0FBRTFELGlDQUE2QjtBQUM3Qix5Q0FBcUM7QUFDckMsdUNBQW1DO0FBR25DLElBQVUsUUFBUSxDQUlqQjtBQUpELFdBQVUsUUFBUTtJQUNELGFBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLGNBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxhQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQyxFQUpTLFFBQVEsS0FBUixRQUFRLFFBSWpCO0FBRUQsNERBQTREO0FBQzVEO0lBS0ksWUFBb0IsUUFBd0IsRUFDaEMsU0FBc0I7UUFEZCxhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUNoQyxjQUFTLEdBQVQsU0FBUyxDQUFhO1FBSGxDLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJTixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksV0FBVyxDQUFDLGlCQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTCxNQUFNLENBQUMsU0FBc0I7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUk7UUFDQSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsK0NBQStDO1lBQy9DLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV0QixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQVM7UUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFtQjtRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ25CLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUlELDJCQUEyQjtBQUMzQjtJQVNJLFlBQW9CLE1BQWdCO1FBQWhCLFdBQU0sR0FBTixNQUFNLENBQVU7UUFDaEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLDJCQUFlLENBQzNCLGlCQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSwyQkFBZSxDQUMzQixpQkFBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksMkJBQWUsQ0FDM0IsaUJBQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSwyQkFBZSxDQUMzQixpQkFBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPLENBQUMsU0FBMEI7UUFDOUIsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFDRCxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEIsS0FBSyxDQUFDO1lBQ1YsQ0FBQztZQUNELEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN0QixLQUFLLENBQUM7WUFDVixDQUFDO1lBQ0QsS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFDRCxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEIsS0FBSyxDQUFDO1lBQ1YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQW1CO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUFFRCxZQUFvQixTQUFRLENBQUMsQ0FBQyxNQUFNO0lBS2hDLFlBQW9CLE9BQXdCO1FBQ3hDLEtBQUssRUFBRSxDQUFDO1FBRFEsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFFeEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJO1FBQ0EsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUUzQix5Q0FBeUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFcEMsMkNBQTJDO1FBQzNDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN2RSxNQUFNLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUVyQix5Q0FBeUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUMvQixJQUFJLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsQyx3Q0FBd0M7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FDL0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxlQUFlLENBQUMsTUFBZ0IsRUFBRSxHQUFlO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sWUFBWSxXQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxZQUFZLG1CQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyw0Q0FBNEM7Z0JBQzVDLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLCtCQUErQjtnQkFDL0IsTUFBTSxDQUFDO1lBQ1gsQ0FBQztZQUNELDhDQUE4QztZQUM5QyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVWLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVuRSxtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFqRUQsd0JBaUVDIn0=