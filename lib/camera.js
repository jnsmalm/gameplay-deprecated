/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

var Utils = require('/utils.js').Utils;
var Entity = require('/entity.js').Entity;
var Vector3 = require('/math.js').Vector3;
var Matrix = require('/math.js').Matrix;

function Camera() {
    Entity.call(this);

    Object.defineProperty(this, 'view', {
        get: (function() {
            var _view = new Matrix();
            var _lookAt = new Vector3();

            return function() {
                var transform = this.transform;
                transform.position.add(transform.forward(), _lookAt);
                return Matrix.lookAt(transform.position, _lookAt,
                    transform.up(), _view);
            }
        })()
    });

    Object.defineProperty(this, 'viewProjection', {
        get: (function() {
            var _viewProjection = new Matrix();

            return function() {
                return this.projection.multiply(this.view, _viewProjection);
            }
        })()
    });
}

Utils.extend(Camera, Entity);

function PerspectiveCamera(options) {
    Camera.call(this);

    // The default setup for the camera is to move it back a little and rotate
    // it, so that the camera is looking at negative z.
    this.transform.translate(0,0,5);
    this.transform.rotate(0,Utils.toRadians(180),0);

    options = Utils.options(options, this);
    options.value('window');
    options.value('aspectRatio', this.window.width / this.window.height);
    options.value('near', 1);
    options.value('far', 1000);
    options.value('fieldOfView', 45);

    Object.defineProperty(this, 'projection', {
        get: (function() {
            var _projection = new Matrix();

            return function() {
                return Matrix.perspective((Math.PI / 180)*this.fieldOfView,
                    this.aspectRatio, this.near, this.far, _projection);
            }
        })()
    });
}

Utils.extend(PerspectiveCamera, Camera);

function OrthographicCamera(options) {
    Camera.call(this);

    // The default setup for the camera is to rotate it, so that the camera is
    // looking at negative z.
    this.transform.rotate(0, Utils.toRadians(180), 0);

    options = Utils.options(options, this);
    options.value('window');
    options.value('aspectRatio', this.window.width / this.window.height);
    options.value('size', 5);
    options.value('near', -1000);
    options.value('far', 1000);

    Object.defineProperty(this, 'projection', {
        get: (function() {
            var _projection = new Matrix();

            return function() {
                var w = this.size * this.aspectRatio;
                return Matrix.ortho(-w, w, -this.size, this.size, this.near,
                    this.far, _projection);
            }
        })()
    });
}

Utils.extend(OrthographicCamera, Camera);

module.exports.PerspectiveCamera = PerspectiveCamera;
module.exports.OrthographicCamera = OrthographicCamera;