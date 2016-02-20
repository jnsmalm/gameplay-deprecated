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

class Box extends $.Entity {
  constructor(colliders, options) {
    // Box is the base class for the floor, walls, roof and bricks in the game 
    // because they all have the same attributes (they are made up of boxes and 
    // the ball will bounce off them).
    super();

    // Add physics to the box to be able for the ball to bounce off. The mass 
    // is set to zero to not be affected by the collision.
    this.rigidBody = this.addRigidBody({ 
      mass: 0,
      bounciness: 1
    });

    this.model = this.addModel($.Model.box());

    // Add a box collider so we can detect collision with other objects. The 
    // size of the collider is the same as the box model.
    this.collider = this.addBoxCollider(new $.Vector3(1,1,1));
    this.collider.entity = this;
    this.collider.rigidBody = this.rigidBody;
    colliders.push(this.collider);
  }

  set color(value) {
    // Set the color of the material for all the meshes in the model.
    for (var i=0; i<this.model.meshes.length; i++) {
      this.model.meshes[i].material.color = value;
    }
  }

  destroy() {
    // Destroy both the entity and the collider.
    this.destroyed = this.collider.destroyed = true;
  }
}

module.exports.Box = Box;