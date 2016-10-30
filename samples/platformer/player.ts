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

import * as $ from "../../lib/lib"
import { SpriteAnimation, SpriteSheet } from "./animation"
import { Level } from "./level"
import { Coin } from "./coin"
import { Platform } from "./platform"
import { Content } from "./content"
import { GraphicsContext } from "./context"

namespace Movement {
    export const left = new $.Vector3(-0.1, 0, 0);
    export const right = new $.Vector3(0.1, 0, 0);
    export const jump = new $.Vector3(0, 19, 0);
}

/** Controls player movement and which animation to play. */
class PlayerController {
    transform: $.Transform;
    jumpSound: SoundSource;
    jumpCount = 0;

    constructor(private animator: PlayerAnimator, 
        private rigidBody: $.RigidBody) {
            this.jumpSound = new SoundSource(Content.SoundBuffers.jump);
        }

    attach(transform: $.Transform) {
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

    update(elapsedTime: number) {
        this.animator.animate("idle");
        if ($.Game.keyboard.isKeyDown($.KeyCode.leftArrow)) {
            this.moveLeft()
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

type PlayerAnimation = "idle" | "left" | "right" | "jump" | "fall";

/** Animates the player. */
class PlayerAnimator {
    walk: SpriteAnimation;
    idle: SpriteAnimation;
    jump: SpriteAnimation;
    fall: SpriteAnimation;

    /** Current player animation. */
    anim: SpriteAnimation;

    constructor(private sprite: $.Sprite) {
        this.walk = new SpriteAnimation(
            Content.SpriteSheets.walk, undefined, 7, true);
        this.idle = new SpriteAnimation(
            Content.SpriteSheets.idle, undefined, 7, true);
        this.jump = new SpriteAnimation(
            Content.SpriteSheets.jump, ["2"], 7, false);
        this.fall = new SpriteAnimation(
            Content.SpriteSheets.jump, ["7"], 7, false);
        this.anim = this.idle;
    }

    animate(animation: PlayerAnimation) {
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

    update(elapsedTime: number) {
        this.anim.update(elapsedTime);
        this.anim.animate(this.sprite);
        this.sprite.origin = new $.Vector2(
            this.sprite.width / 2, this.sprite.height / 2);
    }
}

export class Player extends $.Entity {
    rigidBody: $.RigidBody;
    collider: $.BoxCollider;
    controller: PlayerController;

    constructor(private context: GraphicsContext) {
        super();
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
        this.controller = this.addComponent(
            new PlayerController(animator, this.rigidBody));

        this.addComponent(this.rigidBody);

        // Box collider for collision detection.
        this.collider = this.addComponent(new $.BoxCollider(
            new $.Vector3(0.4, 0.8, 1)));
    }

    /**
     * Handle collisions with coins and platforms.
     * @entity Coin or platform.
     * @mtv Minimum translation vector is the shortest distance that the
     * colliding object can be moved in order to no longer be colliding with
     * the other object.
     */
    handleCollision(entity: $.Entity, mtv?: $.Vector3) {
        if (entity instanceof Coin) {
            entity.pickUp();
        }
        if (entity instanceof Platform) {
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