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
var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');

function PerspectiveCamera(aspectRatio, fieldOfView, near, far) {
    Entity.call(this);

    // The default setup for the camera is to move it back a little and rotate
    // it, so that the camera is looking at negative z.
    this.transform.translate(0,0,5);
    this.transform.rotate(0,Utils.toRadians(180),0);

    this.aspectRatio = aspectRatio;
    this.near = near || 1;
    this.far = far || 1000;
    this.fieldOfView = fieldOfView || 45;

    this._view = mat4.create();
    this._projection = mat4.create();
    this._lookAt = vec3.create();
}

Utils.extend(PerspectiveCamera, Entity);

PerspectiveCamera.prototype.projection = function() {
    return mat4.perspective(this._projection, (Math.PI / 180)*this.fieldOfView,
        this.aspectRatio, this.near, this.far);
};

PerspectiveCamera.prototype.view = function() {
    vec3.add(this._lookAt, this.transform.position(),
        this.transform.forward());
    mat4.lookAt(this._view, this.transform.position(), this._lookAt,
        this.transform.up());
    return this._view;
};

module.exports.PerspectiveCamera = PerspectiveCamera;