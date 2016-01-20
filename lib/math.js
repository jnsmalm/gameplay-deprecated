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

var vec2 = require('/gl-matrix/vec2.js');
var vec3 = require('/gl-matrix/vec3.js');
var vec4 = require('/gl-matrix/vec4.js');
var mat4 = require('/gl-matrix/mat4.js');
var quat = require('/gl-matrix/quat.js');

class Vector2 extends Float32Array {
  constructor(x, y) {
    var vec = vec2.fromValues(x||0, y||0);
    vec.__proto__ = Vector2.prototype;
    return vec;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }
}

class Vector3 extends Float32Array {
  constructor(x, y, z) {
    var vec = vec3.fromValues(x||0, y||0, z||0);
    vec.__proto__ = Vector3.prototype;
    return vec;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }

  get z() {
    return this[2];
  }

  set z(value) {
    this[2] = value;
  }

  set(x, y, z) {
    if (arguments.length === 1) {
      vec3.copy(this, arguments[0]);
    } else if (arguments.length === 3) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
    } else {
      throw new TypeError('Wrong number of arguments.');
    }
    return this;
  }

  add(value, result) {
    return vec3.add(result || new Vector3(), this, value);
  }

  subtract(value, result) {
    return vec3.sub(result || new Vector3(), this, value);
  }

  multiply(value, result) {
    return vec3.mul(result || new Vector3(), this, value);
  }

  divide(value, result) {
    return vec3.divide(result || new Vector3(), this, value);
  }

  dot(value) {
    return vec3.dot(this, value);
  }

  cross(value, result) {
    return vec3.cross(result || new Vector3(), this, value);
  }

  scale(value, result) {
    return vec3.scale(result || new Vector3(), this, value);
  }

  transform(value, result) {
    if (value instanceof Matrix) {
      return vec3.transformMat4(result || new Vector3(), this, value);
    }
    if (value instanceof Quaternion) {
      return vec3.transformQuat(result || new Vector3(), this, value);
    }
  }

  negate(result) {
    return vec3.negate(result || new Vector3(), this);
  }

  lerp(value, t, result) {
    return vec3.lerp(result || new Vector3(), value, this, t);
  }

  normalize(result) {
    return vec3.normalize(result || new Vector3(), this);
  }

  len() {
    return vec3.length(this);
  }

  squaredDistance(value) {
    return vec3.squaredDistance(this, value);
  }

  toString() {
    return vec3.str(this);
  }
}

Vector3.prototype.sub = Vector3.prototype.subtract;

var _temp3 = new Vector3();

class Vector4 extends Float32Array {
  constructor(x, y, z, w) {
    var vec = vec4.fromValues(x||0, y||0, z||0, w||0);
    vec.__proto__ = Vector4.prototype;
    return vec;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }

  get z() {
    return this[2];
  }

  set z(value) {
    this[2] = value;
  }

  get w() {
    return this[3];
  }

  set w(value) {
    this[3] = value;
  }
}

class Matrix extends Float32Array {
  constructor() {
    var mat = mat4.create();
    mat.__proto__ = Matrix.prototype;
    return mat;
  }

  set(value) {
    return mat4.copy(this, value);
  }

  translate(x, y, z) {
    _temp3.set(x, y, z);
    mat4.translate(this, this, _temp3);
    return this;
  }

  rotate(x, y, z) {
    if (x) {
      mat4.rotateX(this, this, x);
    }
    if (y) {
      mat4.rotateY(this, this, y);
    }
    if (z) {
      mat4.rotateZ(this, this, z);
    }
  }

  scale(x, y, z) {
    _temp3.set(x, y, z);
    mat4.scale(this, this, _temp3);
    return this;
  }

  multiply(value, result) {
    return mat4.multiply(result || new Matrix(), this, value);
  }

  invert(result) {
    return mat4.invert(result || new Matrix(), this);
  }

  toString() {
    return mat4.str(this);
  }

  static perspective(fieldOfView, aspectRatio, near, far, result) {
    return mat4.perspective(
      result || new Matrix(), fieldOfView, aspectRatio, near, far);
  }

  static ortho(left, right, bottom, top, near, far, result) {
    return mat4.ortho(
        result || new Matrix(), left, right, bottom, top, near, far);
  }

  static lookAt(eye, center, up, result) {
    return mat4.lookAt(result || new Matrix(), eye, center, up);
  }
}

class Quaternion extends Float32Array {
  constructor() {
    var qua = quat.create();
    qua.__proto__ = Quaternion.prototype;
    return qua;
  }

  add(value, result) {
    return quat.add(result || new Quaternion(), this, value);
  }

  mul(value, result) {
    return quat.mul(result || new Quaternion(), this, value);
  }

  invert(result) {
    return quat.invert(result || new Quaternion(), this);
  }

  rotateX(value) {
    return quat.rotateX(this, this, value);
  }

  rotateY(value) {
    return quat.rotateY(this, this, value);
  }

  rotateZ(value) {
    return quat.rotateZ(this, this, value);
  }

  toString() {
    return quat.str(this);
  }
}

module.exports.Vector2 = Vector2;
module.exports.Vector3 = Vector3;
module.exports.Vector4 = Vector4;
module.exports.Matrix = Matrix;
module.exports.Quaternion = Quaternion;