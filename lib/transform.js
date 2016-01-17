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

var _forward = new Vector3(0,0,1);
var _up = new Vector3(0,1,0);
var _right = new Vector3(-1,0,0);

class Transform extends Matrix {
  constructor() {
    var tfm = new Matrix();
    tfm.__proto__ = Transform.prototype;
    tfm.parent = null;
    tfm._world = new Matrix();
    tfm._position = new Vector3();
    tfm._inverted = new Matrix();
    return tfm;
  }

  get position() {
    this._position.set(this[12], this[13], this[14]);
    if (!this.parent) {
      return this._position;
    }
    return this._position.transform(this.parent.world, this._position);
  }

  set position(value) {
    if (!this.parent) {
      this[12] = value[0];
      this[13] = value[1];
      this[14] = value[2];
    } else {
      value.transform(
        this.parent.world.invert(this._inverted), this._position);
      this[12] = this._position[0];
      this[13] = this._position[1];
      this[14] = this._position[2];
    }
  }

  get world() {
    if (!this.parent) {
      return this;
    }
    return this.parent.world.multiply(this, this._world);
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
    this.position = this.position.add(new Vector3(x, y, z));
  }
}

module.exports.Transform = Transform;