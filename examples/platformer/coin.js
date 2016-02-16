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

class Coin extends $.Entity {
  constructor(colliders, options) {
    super();
    var self = this;

    // Adds the sprite for the coin.
    this.sprite = this.addSprite($.Content.textures.coin);
    this.sprite.pixelsPerUnit = 10;

    // Adds a box collider so we can detect collision with the player. The 
    // size of the collider is set to the same size as the sprite. Also give the 
    // collider a name so the player knows that it has collided with a coin.
    this.collider = this.addBoxCollider(new $.Vector3(
      this.sprite.width, this.sprite.height, 0));
    this.collider.name = 'coin';
    this.collider.destroy = function() {
      // EWhen the collider is destroyed deactivate both the collider and the 
      // coin itself.
      this.active = false;
      self.active = false;
      self.elapsed = 0;
    };
    colliders.push(this.collider);

    // The float component makes the coin float up and down.
    this.components.push(new Float(this.transform));

    this.transform.position = 
      new $.Vector3(options.position.x, options.position.y, 0);

    this.elapsed = 0;
    this.drawOrder = 100;
  }

  update(elapsed) {
    super.update(elapsed);
    if (!this.active) {
      // Five seconds after being picked up by the player, the sprite will 
      // respawn. Set the alpha channel of the sprite to zero.
      if ((this.elapsed += elapsed) > 5) {
        this.active = true;
        this.collider.active = true;
        this.elapsed = 0;
        this.sprite.color.a = 0;
      }
    }
    // Fade in the sprite by changing the alpha channel. It doesn't matter if it
    // goes above 1.0, won't make any difference.
    this.sprite.color.a += 0.1;
  }
}

class Float {
  constructor(transform) {
    this.transform = transform;
    this.y = null;
    this.elapsed = 0;
  }

  update(elapsed) {
    this.elapsed += elapsed;
    if (this.y === null) {
      // The first time it's being updated, set the initial y position.
      this.y = this.transform.position.y;
    }
    var x = this.transform.position.x;
    // Animate the y component over time.
    var y = this.y + Math.cos(this.elapsed * 2 + x * 2) * 0.1;
    this.transform.position = new $.Vector3(x, y, 0);
  }
}

module.exports.Coin = Coin;