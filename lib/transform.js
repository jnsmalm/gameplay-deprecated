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
var Matrix = require('/math.js').Matrix;
var Quaternion = require('/math.js').Quaternion;

var _forward = new Vector3(0,0,1);
var _up = new Vector3(0,1,0);
var _right = new Vector3(-1,0,0);
var _scale = new Vector3();

class Transform extends Matrix {
  constructor() {
    var tfm = new Matrix();
    tfm.__proto__ = Transform.prototype;
    tfm.parent = null;
    tfm._position = new Vector3();
    tfm._rotation = new Quaternion();
    tfm._scaling = new Vector3(1,1,1);
    tfm._temp = {
      position: new Vector3(),
      rotation: new Vector3(),
      scaling: new Vector3(),
      world: new Matrix(),
      inverted: new Vector3()
    };
    return tfm;
  }

  get position() {
    this._temp.position.set(this[12], this[13], this[14]);
    if (!this.parent) {
      return this._temp.position;
    }
    return this._temp.position.transform(
      this.parent.world, this._temp.position);
  }

  set position(value) {
    if (!this.parent) {
      this[12] = value[0];
      this[13] = value[1];
      this[14] = value[2];
    } else {
      value.transform(
        this.parent.world.invert(this._temp.inverted), this._temp.position);
      this[12] = this._temp.position[0];
      this[13] = this._temp.position[1];
      this[14] = this._temp.position[2];
    }
  }

  get rotation() {
    if (!this.parent) {
      return this._rotation;
    } else {
      return this.parent.rotation.mul(this._rotation, this._temp.rotation);
    }
  }

  get scaling() {
    if (!this.parent) {
      return this._scaling;
    } else {
      return this.parent.scaling.mul(this._scaling, this._temp.scaling);
    }
  }

  get world() {
    if (!this.parent) {
      return this;
    }
    return this.parent.world.multiply(this, this._temp.world);
  }

  get forward() {
    return new Vector3(this[8], this[9], this[10]);
  }

  get up() {
    return new Vector3(this[4], this[5], this[6]);
  }

  get right() {
    return new Vector3(this[0], this[1], this[2]);
  }

  move(x, y, z) {
    this[12] += x;
    this[13] += y;
    this[14] += z;
  }

  rotate(x, y, z) {
    if (x) {
      this._rotation.rotateX(x);
    }
    if (y) {
      this._rotation.rotateY(y);
    }
    if (z) {
      this._rotation.rotateZ(z);
    }
    super.rotate(x, y, z);
  }

  scale(x, y, z) {
    this._scaling.multiply(_scale.set(x, y, z), this._scaling);
    super.scale(x, y, z);
  }
}

module.exports.Transform = Transform;