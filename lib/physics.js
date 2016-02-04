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

var Vector3 = require('/math.js').Vector3;
var Transform = require('/transform.js').Transform;

var _gravity = new Vector3();
var _force = new Vector3();
var _drag = new Vector3();
var _velocity = new Vector3();
var _mtv = new Vector3();
var _impulse = new Vector3();
var _scale = new Vector3();

var Physics = {
  gravity: new Vector3(0,-9.81,0)
};

class RigidBody {
  constructor(options) {
    options = options || {};
    this.transform = new Transform();
    this.force = new Vector3();
    this.velocity = new Vector3();
    this.enableGravity = options.enableGravity || false;
    if (options.mass !== undefined)  {
      this.mass = options.mass;
    } else {
      this.mass = 1;
    }
    this.bounciness = options.bounciness || 0.2;
    this.drag = options.drag || 0;
    this.invertedMass = this.mass ? 1 / this.mass : 0;
  }

  addForce(x, y, z) {
    if (arguments.length === 1) {
      this.force.add(arguments[0], this.force);
    } else {
      _force.set(x, y, z);
      this.force.add(_force, this.force);
    }
  }

  addImpulse(x, y, z) {
    if (arguments.length === 1) {
      this.velocity.add(arguments[0], this.velocity);
    } else {
      _velocity.set(x,y,z);
      this.velocity.add(_velocity, this.velocity);
    }
  }

  update(elapsed) {
    if (this.enableGravity) {
      this.addForce(Physics.gravity.scale(this.mass, _gravity));
    }
    if (this.mass) {
      _force = this.force.scale(this.invertedMass * elapsed, _force);
      this.velocity = this.velocity.add(_force, this.velocity);
    }
    if (this.drag > 0) {
      _drag = this.velocity
        .normalize(_drag)
        .scale(this.drag * elapsed, _drag);
      this.velocity = this.velocity.sub(_drag);
    }
    _velocity = this.velocity.scale(elapsed, _velocity);
    this.transform.move(_velocity[0], _velocity[1], _velocity[2]);
    this.force.set(0, 0, 0);
  }

  static onCollision(rigidBody1, rigidBody2, mtv) {
    resolveCollision(rigidBody1, rigidBody2, mtv);
    calculateVelocity(rigidBody1, rigidBody2, mtv);
  }
}

function resolveCollision(a, b, mtv) {
  var invertedMassSum = a.invertedMass + b.invertedMass;
  if (!invertedMassSum) {
    return;
  }
  _mtv = mtv.scale(a.invertedMass / invertedMassSum, _mtv);
  a.transform.position = a.transform.position.add(_mtv, _mtv);
  _mtv = mtv.scale(b.invertedMass / invertedMassSum, _mtv);
  b.transform.position = b.transform.position.sub(_mtv, _mtv);
}

function calculateVelocity(a, b, mtv) {
  var invertedMassSum = a.invertedMass + b.invertedMass;
  if (!invertedMassSum) {
    return;
  }
  _velocity = a.velocity.sub(b.velocity, _velocity);
  var angle = _velocity.dot(mtv.normalize(mtv));
  if (angle > 0) {
    // Already moving away from each other.
    return;
  }
  var bounciness = Math.min(a.bounciness, b.bounciness);
  var scalar = -(1 + bounciness) * angle;
  if (invertedMassSum > 0) {
    scalar /= invertedMassSum;
  }
  _impulse = mtv.scale(scalar, _impulse);
  a.addImpulse(_impulse.scale(a.invertedMass, _scale));
  b.addImpulse(_impulse.scale(-b.invertedMass, _scale));
}

module.exports.Physics = Physics;
module.exports.RigidBody = RigidBody;