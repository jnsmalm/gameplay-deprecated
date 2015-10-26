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
var Vector3 = require('/matrix.js').Vector3;
var Matrix = require('/matrix.js').Matrix;

function PerspectiveCamera(options) {
    var self = this;
    Entity.call(this);

    // The default setup for the camera is to move it back a little and rotate
    // it, so that the camera is looking at negative z.
    this.transform.translate(0,0,5);
    this.transform.rotate(0,Utils.toRadians(180),0);

    options = Utils.options(options, this);
    options.value('aspectRatio', 800/600);
    options.value('near', 1);
    options.value('far', 1000);
    options.value('fieldOfView', 45);

    this._view = new Matrix();
    this._projection = new Matrix();
    this._lookAt = new Vector3();

    Object.defineProperty(this, 'projection', {
        get: function() {
            return Matrix.perspective((Math.PI / 180)*this.fieldOfView,
                this.aspectRatio, this.near, this.far, self._projection);
        }
    });

    Object.defineProperty(this, 'view', {
        get: function() {
            var transform = self.transform;
            transform.position.add(transform.forward(), self._lookAt);
            Matrix.lookAt(transform.position, self._lookAt, transform.up(),
                self._view);
            return self._view;
        }
    });
}

Utils.extend(PerspectiveCamera, Entity);

module.exports.PerspectiveCamera = PerspectiveCamera;