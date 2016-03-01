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

var Vector4 = require('./math.js').Vector4;

class Color extends Vector4 {
  constructor(r, g, b, a) {
    var clr = new Vector4(r||0, g||0, b||0, a||0);
    clr.__proto__ = Color.prototype;
    return clr;
  }

  get r() {
    return this[0];
  }

  set r(value) {
    this[0] = value;
  }

  get g() {
    return this[1];
  }

  set g(value) {
    this[1] = value;
  }

  get b() {
    return this[2];
  }

  set b(value) {
    this[2] = value;
  }

  get a() {
    return this[3];
  }

  set a(value) {
    this[3] = value;
  }

  static fromRGBA(r, g, b, a) {
    return new Color(r / 255, g / 255, b / 255, a / 255);
  }

  static white() {
    return Color.fromRGBA(255, 255, 255, 255);
  }

  static black() {
    return Color.fromRGBA(0, 0, 0, 255);
  }

  static red() {
    return Color.fromRGBA(255, 0, 0, 255);
  }

  static green() {
    return Color.fromRGBA(0, 255, 0, 255);
  }

  static blue() {
    return Color.fromRGBA(0, 0, 255, 255);
  };

  static cornflowerBlue() {
    return Color.fromRGBA(100, 149, 237, 255);
  }
}

module.exports.Color = Color;