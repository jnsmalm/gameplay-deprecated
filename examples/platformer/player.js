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

class Player extends $.Entity {
  constructor(colliders) {
    super();

    this.bounceSound = new SoundSource($.Content.buffers.bounce);
    this.coinSound = new SoundSource($.Content.buffers.coin);

    // The rigid body makes it so the player is affected by gravity and makes 
    // it more easy to respond to collision with the platforms.
    this.rigidBody = this.addRigidBody({ 
      enableGravity: true, 
      bounciness: 0.0001 
    });

    // Adds the sprite for the player, default it's set to the first frame of 
    // the idle animation.
    this.sprite = this.addSprite();
    this.sprite.source = $.Content.sheets.idle.getFrameSource(0);
    this.sprite.pixelsPerUnit = 10;

    // Adds a box collider so we can detect collision with other objects. The 
    // size width is set to be a bit smaller than the actual sprite width.
    var collider = this.addBoxCollider(
      new $.Vector3(this.sprite.width/2, this.sprite.height, 0));
    collider.onCollision = this.onCollision.bind(this);
    colliders.push(collider);

    // The player controller makes the player walk and jump.
    this.components.push(new PlayerController(this));

    // Setup all the animations used by the player.
    this.animations = {
      idle: new $.SpriteAnimation({
        sheet: $.Content.sheets.idle,
        loop: true,
        length: 14
      }),
      walk: new $.SpriteAnimation({
        sheet: $.Content.sheets.walk,
        loop: true,
        length: 4
      }),
      jump: new $.SpriteAnimation({
        sheet: $.Content.sheets.jump,
        loop: false,
        length: 5
      }),
      fall: new $.SpriteAnimation({
        sheet: $.Content.sheets.jump,
        loop: false,
        start: 6,
        length: 5
      })
    };

    this.isWalking = false;
    this.sprite.animation = this.animations.idle;
    this.direction = 'left';
    this.drawOrder = 1000;
    this.isJumping = false;
    this.isDoubleJumping = false;
  }

  onCollision(collider, mtv) {
    if (collider.name === 'coin') {
      // When colliding with a coin, just destroy the coin (don't bother with 
      // collision response).
      if (collider.active) {
        this.coinSound.play();
        collider.destroy();
      }
      return;
    }
    if (this.rigidBody.velocity.y > 0 || mtv.y <= 0 || mtv.y > 0.5) {
      // The player is probably jumping, should not respond to collision.
      return;
    }
    // The player has landed on a platform, respond to the collision and reset 
    // the jumping flags.
    $.RigidBody.handleCollision(this.rigidBody, collider.rigidBody, mtv);
    this.isJumping = false;
    this.isDoubleJumping = false;
  }

  walk(direction) {
    var speed = 0.1;
    if (this.direction !== direction) {
      // This will flip the player sprite so it's facing the right direction.
      this.transform.scale(-1, 1, 1);
    }
    if (direction === 'left') {
      this.transform.move(-speed,0,0);
    }
    if (direction === 'right') {
      this.transform.move(speed,0,0);
    }
    this.direction = direction;
    this.isWalking = true;
  }

  jump() {
    if (this.isDoubleJumping) {
      // The player can only jump twice before landing on a platform.
      return;
    }
    if (this.isJumping) {
      this.isDoubleJumping = true;
    }
    // The player should jump, reset the velocity and give her a new boost.
    this.rigidBody.velocity = new $.Vector3();
    this.rigidBody.addImpulse(0, 18, 0);
    this.isJumping = true;
    this.bounceSound.play();
  }

  animate(elapsed) {
    // This will select the appropriate animation depending on player action.
    if (this.rigidBody.velocity.y > 0) {
      this.sprite.animation = this.animations.jump;
    } else if (this.rigidBody.velocity.y + 1 < 0) {
      this.sprite.animation = this.animations.fall;
    } else if (this.isWalking) {
      this.sprite.animation = this.animations.walk;
    } else {
      this.sprite.animation = this.animations.idle;
    }
  }

  update(elapsed) {
    super.update(elapsed);
    this.animate(elapsed);
    if (this.transform.position.y < -20) {
      // When the player has fallen off the ground, just reset the position.
      this.transform.position = new $.Vector3(-4, 7, 0);
      this.rigidBody.velocity = new $.Vector3();
    }
    this.isWalking = false;
  }
}

class PlayerController {
  constructor(player) {
    this.keyboard = $.Game.keyboard;
    this.player = player;
  }

  update() {
    if (this.keyboard.isKeyDown($.Keys.left)) {
      this.player.walk('left');
    }
    if (this.keyboard.isKeyDown($.Keys.right)) {
      this.player.walk('right');
    }
    if (this.keyboard.isKeyPress($.Keys.space)) {
      this.player.jump();
    }
  }
}

module.exports.Player = Player;