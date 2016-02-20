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
  '/box.js'
);

class Paddle extends $.Entity {
  constructor(colliders) {
    super();

    // Add physics to the box. The mass is set to zero to not be affected by
    // collisions with other objects.
    this.rigidBody = this.addRigidBody({ 
      mass: 0,
      bounciness: 1 
    });

    // Add a box model, scale it to a appropriate size and set the color.
    var model = this.addModel($.Model.box());
    model.transform.scale(3,1,1);
    for (var i=0; i<model.meshes.length; i++) {
      model.meshes[i].material.color = new $.Color(0.3,0,0,1);
    }

    // Adds a box collider so we can detect collision with other objects. The 
    // size of the collider is the same as the box model.
    var collider = this.addBoxCollider(new $.Vector3(3,1,1));
    collider.entity = this;
    collider.rigidBody = this.rigidBody;
    colliders.push(collider);

    // The paddle controller makes the paddle move.
    this.components.push(new PaddleController(this.transform));
  }
}

class PaddleController {
  constructor(transform) {
    this.keyboard = $.Game.keyboard;
    this.transform = transform;
  }

  update() {
    var speed = 0;
    if (this.keyboard.isKeyDown($.Keys.left)) {
        speed = -0.25;
    }
    if (this.keyboard.isKeyDown($.Keys.right)) {
        speed = 0.25;
    }
    // The paddle should not be able to move ouside the level area.
    var x = Math.min(Math.max(this.transform.position.x + speed, -8), 8);
    this.transform.position = new $.Vector3(x, -9.5, 0);
  }
}

module.exports.Paddle = Paddle;