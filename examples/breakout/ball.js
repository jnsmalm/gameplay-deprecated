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

var $ = require('/../../lib/import.js').library();

class Ball extends $.Entity {
  constructor(colliders, options) {
    super();

    // Add physics to the ball, this enables us to give the ball velocity and 
    // bounce off other objects.
    this.rigidBody = this.addRigidBody({ 
      bounciness: 1 
    });

    // Add a sphere model for the ball and set the material color.
    var model = this.addModel($.Model.sphere());
    for (var i=0; i<model.meshes.length; i++) {
      model.meshes[i].material.color = new $.Color(0.3,0,0,1);
    }

    // Add a sphere collider so we can detect collision with other objects,
    // radius is set to 0.5 which is the same size as the sphere model.
    this.collider = this.addSphereCollider(0.5);
    this.collider.rigidBody = this.rigidBody;
    this.collider.onCollision = this.onCollision.bind(this);
    colliders.push(this.collider);
  }

  onCollision(collider, mtv) {
    if (collider.entity.name === 'floor') {
      // Ball has collided with the floor, call method which decides how to
      // handle that. Don't bother with collision response.
      this.onFloorCollision();
      return;
    }
    if (collider.entity.name === 'brick') {
      // Colliding with brick, destroy the brick.
      collider.entity.destroy();
    }
    // Handle the collision which make the ball bounce.
    $.RigidBody.handleCollision(this.rigidBody, collider.rigidBody, mtv);
  }

  onFloorCollision() {
    // The level method of handling floor collision will override this.
  }

  launch() {
    if (this.transform.parent === null) {
      // Ball is still in play.
      return;
    }
    // Store the current position of the ball and detach the ball from the 
    // paddle.
    var position = this.transform.position;
    this.transform.parent = null;

    // Reset the position of the ball in world space and make the ball fly off.
    this.transform.position = position;
    this.rigidBody.addImpulse(new $.Vector3(5,10,0));
  }

  reset(paddle) {
    // Stop the ball from moving, attach the ball to the paddle and set the 
    // initial position.
    this.rigidBody.velocity = new $.Vector3();
    this.transform.parent = paddle.transform;
    this.transform.position = 
      paddle.transform.position.add(new $.Vector3(0,1.5,0));
  }
}

module.exports.Ball = Ball;