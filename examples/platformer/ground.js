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
  '/content.js'
);

class Ground extends $.Entity {
  constructor(colliders, options) {
    super();

    // The rigid body makes it more easy to respond to collision. The mass is 
    // set to zero to not be affected by gravity and collision.
    var rigidBody = this.addRigidBody({ 
      mass: 0
    });

    // Adds the sprite component for the dirt part of the ground.
    var dirt = this.addSprite($.Content.textures.dirt);
    dirt.pixelsPerUnit = 10;
    dirt.source.w = dirt.texture.width * options.size.x;
    dirt.source.h = dirt.texture.height * options.size.y;

    // Adds the sprite component for the grass part of the ground. It's being 
    // moved so it's on top of the dirt.
    var grass = this.addSprite($.Content.textures.grass);
    grass.pixelsPerUnit = 10;
    grass.transform.parent = this.transform;
    grass.source.w = grass.texture.width * options.size.x;
    grass.transform.move(0, dirt.height/2, 0);

    // Adds a box collider so we can detect collision with other objects. The 
    // size of the collider only covers the grass part.
    var collider = this.addBoxCollider(
      new $.Vector3(grass.width, grass.height, 0));
    collider.rigidBody = rigidBody;
    collider.transform.move(0, dirt.height/2, 0);
    colliders.push(collider);

    if (options.order) {
      this.drawOrder = options.order;
    }

    this.transform.position = 
      new $.Vector3(options.position.x, options.position.y, 0);
  }
}

module.exports.Ground = Ground;