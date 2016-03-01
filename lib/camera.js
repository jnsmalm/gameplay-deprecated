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

var Utils = require('./utils.js').Utils;
var Transform = require('./transform.js').Transform;
var Vector3 = require('./math.js').Vector3;
var Matrix = require('./math.js').Matrix;

var _view = new Matrix();
var _viewProjection = new Matrix();
var _lookAt = new Vector3();
var _projection = new Matrix();

class Camera {

  constructor(options) {
    this.transform = new Transform();
    // The default setup for the camera is to move it back a little and 
    // rotate it, so that the camera is looking at negative z.
    this.transform.translate(0,0,2);
    this.transform.rotate(0,Utils.toRadians(180),0);

    options = Utils.options(options, this);
    options.value('window');
    options.value('aspectRatio', this.window.width / this.window.height);
    options.value('near', 1);
    options.value('far', 1000);
    options.value('fieldOfView', 45);
    options.value('orthographicSize', 5);
    options.value('orthographic', false);
  }

  get projection() {
    if (this.orthographic) {
      var w = this.orthographicSize * this.aspectRatio;
      return Matrix.ortho(-w, w, -this.orthographicSize,
        this.orthographicSize, this.near, this.far, _projection);
    }
    return Matrix.perspective((Math.PI / 180)*this.fieldOfView,
      this.aspectRatio, this.near, this.far, _projection);
  }

  get view() {
    this.transform.position.add(this.transform.forward, _lookAt);
    return Matrix.lookAt(this.transform.position, _lookAt,
      this.transform.up, _view);
  }

  get viewProjection() {
    return this.projection.multiply(this.view, _viewProjection);
  }
}

module.exports.Camera = Camera;