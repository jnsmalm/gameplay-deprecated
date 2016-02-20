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

'use strict';

var $ = require('/../../lib/import.js').library().include(
  '/box.js',
  '/paddle.js',
  '/ball.js'
);

class Level extends $.Scene {
  constructor(filepath) {
    super($.Game.window);

    // Create the ball and handle collision with the floor.
    this.ball = new $.Ball(this.colliders);
    this.ball.onFloorCollision = (function() {
      this.ball.reset(this.paddle);
    }).bind(this);
    this.entities.push(this.ball);

    // Create the paddle
    this.paddle = new $.Paddle(this.colliders);
    this.entities.push(this.paddle);

    this.floor = new $.Box(this.colliders);
    this.floor.name = 'floor';
    this.floor.color = $.Color.fromRGBA(216,255,206,5);
    this.floor.transform.translate(0,-20,0);
    this.floor.transform.scale(50,20,50);
    this.entities.push(this.floor);

    this.roof = new $.Box(this.colliders);
    this.roof.transform.translate(0,10,0);
    this.roof.transform.scale(24,1,1);
    this.roof.color = new $.Color(0.3,0,0,1);
    this.entities.push(this.roof);

    this.wall1 = new $.Box(this.colliders);
    this.wall1.transform.translate(10,0,0);
    this.wall1.transform.rotate(0,0,0.05);
    this.wall1.transform.scale(1,20,1);
    this.wall1.color = new $.Color(0.3,0,0,1);
    this.entities.push(this.wall1);

    this.wall2 = new $.Box(this.colliders);
    this.wall2.transform.translate(-10,0,0);
    this.wall2.transform.rotate(0,0,-0.05);
    this.wall2.transform.scale(1,20,1);
    this.wall2.color = new $.Color(0.3,0,0,1);
    this.entities.push(this.wall2);

    this.reset();

    // Move the camera back.
    this.camera.transform.move(0, 0, 25);
  }

  update(elapsed) {
    super.update(elapsed);
    if ($.Game.keyboard.isKeyPress($.Keys.space)) {
      this.start();
    }
    if (!this.hasRemainingBricks) {
      this.reset();
    }
  }

  createBricks() {
    for (var x=0; x<5; x++) {
      for (var y=0; y<4; y++) {
        var brick = new $.Box(this.colliders);
        brick.name = 'brick';
        brick.transform.translate(x*2.7-5.5,y*1.7+2,0);
        brick.transform.scale(2,1,1);
        brick.color = new $.Color(0.2,0.3,0,1);
        this.entities.push(brick);
      }
    }
  }

  get hasRemainingBricks() {
    for (var i=0; i<this.entities.length; i++) {
      if (this.entities[i].name === 'brick') {
        return true;
      }
    }
    return false;
  }

  start() {
    this.ball.launch();
  }

  reset() {
    this.createBricks();
    this.ball.reset(this.paddle);
  }
}

module.exports.Level = Level;