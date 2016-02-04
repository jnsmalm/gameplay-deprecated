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

var Transform = require('/transform.js').Transform;
var RigidBody = require('/physics.js').RigidBody;

class Entity {

  constructor() {
    this.transform = new Transform();
    this.active = true;
    this.components = [];
    this.drawOrder = 0;
    this.destroyed = false;
  }

  addCollider(collider) {
    this.collider = collider;
    if (this.rigidBody) {
      this.collider.rigidBody = this.rigidBody;
    }
    this.collider.transform = this.transform;
    this.components.push(this.collider);
  }

  addModel(model) {
    this.model = model;
    this.model.transform.parent = this.transform;
    this.components.push(this.model);
  }

  addSprite(sprite) {
    this.sprite = sprite;
    this.sprite.transform.parent = this.transform;
    this.components.push(this.sprite);
  }

  addRigidBody(options) {
    this.rigidBody = new RigidBody(options);
    if (this.collider) {
      this.collider.rigidBody = this.rigidBody;
    }
    this.rigidBody.transform = this.transform;
    this.components.push(this.rigidBody);
  }

  update(elapsed) {
    if (!this.active) {
      return;
    }
    for(var i=0; i<this.components.length; i++) {
      if (this.components[i].update) {
        this.components[i].update(elapsed);
      }
    }
  }

  draw() {
    if (!this.active) {
      return;
    }
    for(var i=0; i<this.components.length; i++) {
      if (this.components[i].draw) {
        this.components[i].draw();
      }
    }
  }
}

module.exports.Entity = Entity;