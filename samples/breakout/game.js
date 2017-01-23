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
const game_1 = require("../../lib/game");
const math_1 = require("../../lib/math");
const shader_1 = require("../../lib/shader");
const collision_1 = require("../../lib/collision");
const physics_1 = require("../../lib/physics");
const model_1 = require("../../lib/model");
const camera_1 = require("../../lib/camera");
const keycode_1 = require("../../lib/keycode");
const entity_1 = require("../../lib/entity");
/** Represents paddle, bricks, walls, roof and floor. */
class Box extends entity_1.Entity {
    constructor(name, position, rotation, scale, color = new math_1.Vector3(0.5, 0.5, 0.5)) {
        super();
        this.name = name;
        this.destroyed = false;
        // Create a model and change material color.
        this.model = this.addComponent(model_1.Model.createBox(shader));
        this.model.transform.localScale = scale;
        this.model.meshes[0].material.diffuse = color;
        // Add rigid body for simple physics.
        this.rigidBody = this.addComponent(new physics_1.RigidBody(0, 1));
        // Add collider for collision detection.
        this.collider =
            this.addComponent(new collision_1.BoxCollider(new math_1.Vector3(0.5, 0.5, 0.5)));
        this.collider.transform.localScale = scale;
        this.transform.localPosition = position;
        this.transform.localRotation.rotateZ(rotation);
    }
}
exports.Box = Box;
var Movement;
(function (Movement) {
    Movement.left = new math_1.Vector3(-0.3, 0, 0);
    Movement.right = new math_1.Vector3(0.3, 0, 0);
})(Movement || (Movement = {}));
class PaddleController {
    constructor(ball) {
        this.ball = ball;
    }
    /** Attaches the controller to a transform. */
    attach(transform) {
        this.transform = transform;
    }
    update() {
        if (game_1.Game.keyboard.isKeyDown(keycode_1.KeyCode.leftArrow)) {
            this.transform.move(Movement.left);
        }
        if (game_1.Game.keyboard.isKeyDown(keycode_1.KeyCode.rightArrow)) {
            this.transform.move(Movement.right);
        }
        if (game_1.Game.keyboard.isKeyPress(keycode_1.KeyCode.space)) {
            this.ball.launch();
        }
        // Limit the movement.
        this.transform.localPosition.x =
            Math.max(this.transform.localPosition.x, -6.2);
        this.transform.localPosition.x =
            Math.min(this.transform.localPosition.x, 6.2);
    }
}
exports.PaddleController = PaddleController;
class Ball extends entity_1.Entity {
    constructor(paddleTransform) {
        super();
        // Add collider for collision detection.
        this.collider = this.addComponent(new collision_1.SphereCollider(0.5));
        // Add rigid body for simple physics.
        this.rigidBody = this.addComponent(new physics_1.RigidBody(1, 1));
        // Create a model and change material color.
        this.model = this.addComponent(model_1.Model.createSphere(shader));
        this.model.meshes[0].material.diffuse = new math_1.Vector3(1, 1, 0.5);
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
        this.rigidBody.addImpulse(new math_1.Vector3(3, 10, 0));
    }
    /** Resets the ball at the paddle. */
    reset(paddleTransform) {
        this.transform.parent = paddleTransform;
        this.transform.localPosition = new math_1.Vector3(0, 1.3, 0);
        this.rigidBody.velocity.xyz(0, 0, 0);
    }
}
exports.Ball = Ball;
var Colors;
(function (Colors) {
    Colors.brick = new math_1.Vector3(0, 1, 0.5);
    Colors.paddle = new math_1.Vector3(1, 1, 0.5);
})(Colors || (Colors = {}));
var Breakout;
(function (Breakout) {
    /** Paddle, bricks, walls, roof, floor. */
    let boxes = [];
    /** Minimum translation vector used for bouncing the ball. */
    let mtv = new math_1.Vector3();
    let paddle;
    let ball;
    function init() {
        paddle = new Box("paddle", new math_1.Vector3(0, -9, 0), 0, new math_1.Vector3(3, 1, 1), Colors.paddle);
        boxes.push(paddle);
        ball = new Ball(paddle.transform);
        // Add paddle controller for user input.
        paddle.addComponent(new PaddleController(ball));
        // Create roof, walls and floor.
        boxes.push(new Box("roof", new math_1.Vector3(0, 10, 0), 0, new math_1.Vector3(17, 1, 1)));
        boxes.push(new Box("wall", new math_1.Vector3(-8, 0, 0), -0.1, new math_1.Vector3(1, 20, 1)));
        boxes.push(new Box("wall", new math_1.Vector3(8, 0, 0), 0.1, new math_1.Vector3(1, 20, 1)));
        boxes.push(new Box("floor", new math_1.Vector3(0, -12, 0), 0, new math_1.Vector3(40, 5, 40)));
        // Create bricks
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                let position = new math_1.Vector3(-4 + x * 2.5, 5 - y * 1.5, 0);
                boxes.push(new Box("brick", position, 0, new math_1.Vector3(2, 1, 1), Colors.brick));
            }
        }
    }
    Breakout.init = init;
    /** Draws all objects in the game. */
    function draw() {
        ball.draw();
        for (let box of boxes) {
            if (box.destroyed) {
                // Don't draw box if it has been destroyed.
                continue;
            }
            box.draw();
        }
    }
    Breakout.draw = draw;
    /** Updates objects and does collision detection. */
    function update(elapsedTime) {
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
    Breakout.update = update;
    function collisionDetection(box) {
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
        }
        else {
            // Bounce ball
            physics_1.RigidBody.handleCollision(ball.rigidBody, box.rigidBody, mtv);
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
})(Breakout || (Breakout = {}));
game_1.Game.init();
game_1.Game.graphics.rasterizerState = "cullClockwise";
// Create the camera and move it back a bit.
const camera = camera_1.Camera.createDefault(game_1.Game.window);
camera.transform.localPosition.z = 30;
// Create the shader used for rendering and change light direction.
const shader = new shader_1.BasicShader(game_1.Game.graphics);
shader.light.setDirection(new math_1.Vector3(0, 0, -1));
shader.setView(camera.getView());
shader.setProjection(camera.getProjection());
Breakout.init();
game_1.Game.draw = function () {
    Breakout.draw();
};
game_1.Game.update = function (elapsedTime) {
    if (game_1.Game.keyboard.isKeyDown(keycode_1.KeyCode.escape)) {
        // Exit the game when user presses the escape key.
        game_1.Game.exit();
    }
    Breakout.update(elapsedTime);
};
game_1.Game.run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUVYLHlDQUFxQztBQUNyQyx5Q0FBd0M7QUFDeEMsNkNBQThDO0FBQzlDLG1EQUFpRTtBQUNqRSwrQ0FBNkM7QUFDN0MsMkNBQXVDO0FBQ3ZDLDZDQUF5QztBQUN6QywrQ0FBMkM7QUFDM0MsNkNBQXlDO0FBR3pDLHdEQUF3RDtBQUN4RCxTQUFpQixTQUFRLGVBQU07SUFNM0IsWUFBbUIsSUFBWSxFQUFFLFFBQWlCLEVBQzlDLFFBQWdCLEVBQUUsS0FBYyxFQUFFLEtBQUssR0FBRyxJQUFJLGNBQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUVwRSxLQUFLLEVBQUUsQ0FBQztRQUhPLFNBQUksR0FBSixJQUFJLENBQVE7UUFML0IsY0FBUyxHQUFHLEtBQUssQ0FBQztRQVVkLDRDQUE0QztRQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFOUMscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLG1CQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEQsd0NBQXdDO1FBQ3hDLElBQUksQ0FBQyxRQUFRO1lBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLHVCQUFXLENBQUMsSUFBSSxjQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcs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