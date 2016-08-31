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
  './content.js'
);

class Platform extends $.Entity {
  constructor(colliders, options) {
    super();

    // The rigid body makes it more easy to respond to collision. The mass is 
    // set to zero to not be affected by gravity and collision.
    var rigidBody = this.addRigidBody({
      mass: 0 
    });

    // Adds the sprite for the platform.
    var sprite = this.addSprite($.Content.textures.platform);
    sprite.pixelsPerUnit = 10;

    // Adds a box collider so we can detect collision with the player. The 
    // size of the collider is set to the same size as the sprite.
    var collider = this.addBoxCollider(
      new $.Vector3(sprite.width, sprite.height, 0));
    collider.rigidBody = rigidBody;
    colliders.push(collider);

    this.transform.position = 
      new $.Vector3(options.position.x, options.position.y, 0);
  }
}

module.exports.Platform = Platform;