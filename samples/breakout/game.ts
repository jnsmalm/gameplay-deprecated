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

import { Game } from '../../lib/game'
import { Vector3 } from '../../lib/math'
import { BasicShader } from '../../lib/shader'
import { BoxCollider, SphereCollider } from '../../lib/collision'
import { RigidBody } from '../../lib/physics'
import { Model } from '../../lib/model'
import { Camera } from '../../lib/camera'
import { KeyCode } from '../../lib/keycode'
import { Entity } from '../../lib/entity'
import { Transform } from '../../lib/transform'

/** Represents paddle, bricks, walls, roof and floor. */
export class Box extends Entity {
    destroyed = false;
    collider: BoxCollider;
    model: Model;
    rigidBody: RigidBody;

    constructor(public name: string, position: Vector3, 
        rotation: number, scale: Vector3, color = new Vector3(0.5, 0.5, 0.5)) {

        super();

        // Create a model and change material color.
        this.model = this.addComponent(Model.createBox(shader));
        this.model.transform.localScale = scale;
        this.model.meshes[0].material.diffuse = color;

        // Add rigid body for simple physics.
        this.rigidBody = this.addComponent(new RigidBody(0, 1));

        // Add collider for collision detection.
        this.collider = 
            this.addComponent(new BoxCollider(new Vector3(0.5, 0.5, 0.5)));
        this.collider.transform.localScale = scale;

        this.transform.localPosition = position;
        this.transform.localRotation.rotateZ(rotation);
    }
}

namespace Movement {
    export const left = new Vector3(-0.3, 0, 0);
    export const right = new Vector3(0.3, 0, 0);
}

export class PaddleController {
    /** Transform used for moving the paddle. */
    transform: Transform;

    constructor(public ball: Ball) { }

    /** Attaches the controller to a transform. */
    attach(transform: Transform) {
        this.transform = transform;
    }

    update() {
        if (Game.keyboard.isKeyDown(KeyCode.leftArrow)) {
            this.transform.move(Movement.left);
        }
        if (Game.keyboard.isKeyDown(KeyCode.rightArrow)) {
            this.transform.move(Movement.right);
        }
        if (Game.keyboard.isKeyPress(KeyCode.space)) {
            this.ball.launch();
        }

        // Limit the movement.
        this.transform.localPosition.x = 
            Math.max(this.transform.localPosition.x, -6.2);
        this.transform.localPosition.x = 
            Math.min(this.transform.localPosition.x, 6.2);
    }
}

export class Ball extends Entity {
    collider: SphereCollider;
    model: Model;
    rigidBody: RigidBody;

    constructor(paddleTransform: Transform) {
        super();

        // Add collider for collision detection.
        this.collider = this.addComponent(new SphereCollider(0.5));

        // Add rigid body for simple physics.
        this.rigidBody = this.addComponent(new RigidBody(1, 1));

        // Create a model and change material color.
        this.model = this.addComponent(Model.createSphere(shader));
        this.model.meshes[0].material.diffuse = new Vector3(1, 1, 0.5);

        // Attach to the paddle.
        this.transform.parent = paddleTransform;
        this.transform.localPosition.y = 1.3;
    }

    /** Launches the ball and detaches it from the paddle. */
    launch() {
        if (!this.transform.parent) {
            // The ball is already detached.
            return;
        }
        let position = this.transform.getPosition();
        this.transform.parent = null;
        this.transform.setPosition(position);
        this.rigidBody.addImpulse(new Vector3(3, 10, 0));
    }

    /** Resets the ball at the paddle. */
    reset(paddleTransform: Transform) {
        this.transform.parent = paddleTransform;
        this.transform.localPosition = new Vector3(0, 1.3, 0);
        this.rigidBody.velocity.xyz(0, 0, 0);
    }
}

namespace Colors {
    export const brick = new Vector3(0, 1, 0.5);
    export const paddle = new Vector3(1, 1, 0.5);
}

namespace Breakout {
    /** Paddle, bricks, walls, roof, floor. */
    let boxes: Box[] = [];

    /** Minimum translation vector used for bouncing the ball. */
    let mtv = new Vector3();

    let paddle: Box;
    let ball: Ball;

    export function init() {
        paddle = new Box("paddle", new Vector3(0, -9, 0), 0,
            new Vector3(3, 1, 1), Colors.paddle);
        boxes.push(paddle);

        ball = new Ball(paddle.transform);

        // Add paddle controller for user input.
        paddle.addComponent(new PaddleController(ball));

        // Create roof, walls and floor.
        boxes.push(new Box("roof", new Vector3(0, 10, 0), 0,
            new Vector3(17, 1, 1)));
        boxes.push(new Box("wall", new Vector3(-8, 0, 0), -0.1,
            new Vector3(1, 20, 1)));
        boxes.push(new Box("wall", new Vector3(8, 0, 0), 0.1,
            new Vector3(1, 20, 1)));
        boxes.push(new Box("floor", new Vector3(0, -12, 0), 0,
            new Vector3(40, 5, 40)));

        // Create bricks
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                let position = new Vector3(-4 + x * 2.5, 5 - y * 1.5, 0);
                boxes.push(new Box("brick", position, 0,
                    new Vector3(2, 1, 1), Colors.brick));
            }
        }
    }

    /** Draws all objects in the game. */
    export function draw() {
        ball.draw();
        for (let box of boxes) {
            if (box.destroyed) {
                // Don't draw box if it has been destroyed.
                continue;
            }
            box.draw();
        }
    }

    /** Updates objects and does collision detection. */
    export function update(elapsedTime: number) {
        ball.update(elapsedTime);
        for (let box of boxes) {
            box.update(elapsedTime);
        }
        for (let box of boxes) {
            // Check if the ball is colliding with any box.
            collisionDetection(box);
        }
        allBricksDestroyed();
    }

    function collisionDetection(box: Box) {
        if (box.destroyed) {
            // Box has already been destroyed.
            return;
        }
        if (!ball.collider.isColliding(box.collider, mtv)) {
            // Ball is not colliding with box.
            return;
        }
        if (box.name === 'floor') {
            // Reset ball when colliding with floor.
            ball.reset(paddle.transform);
        } else {
            // Bounce ball
            RigidBody.handleCollision(ball.rigidBody, box.rigidBody, mtv);
        }
        if (box.name === 'brick') {
            // Destroy brick
            box.destroyed = true;
        }
    }

    function allBricksDestroyed() {
        for (let box of boxes) {
            if (box.name === 'brick' && !box.destroyed) {
                // All boxes has not been destroyed.
                return;
            }
        }
        for (let box of boxes) {
            box.destroyed = false;
        }
        ball.reset(paddle.transform);
    }
}

Game.init();
Game.graphics.rasterizerState = "cullClockwise";

// Create the camera and move it back a bit.
const camera = Camera.createDefault(Game.window);
camera.transform.localPosition.z = 30;

// Create the shader used for rendering and change light direction.
const shader = new BasicShader(Game.graphics);
shader.light.setDirection(new Vector3(0, 0, -1));
shader.setView(camera.getView());
shader.setProjection(camera.getProjection());

Breakout.init();

Game.draw = function () {
    Breakout.draw();
}

Game.update = function (elapsedTime: number) {
    if (Game.keyboard.isKeyDown(KeyCode.escape)) {
        // Exit the game when user presses the escape key.
        Game.exit();
    }
    Breakout.update(elapsedTime);
};

Game.run();