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
var Vector3 = require('/matrix.js').Vector3;
var Matrix = require('/matrix.js').Matrix;

var _forward = new Vector3(0,0,1);
var _up = new Vector3(0,1,0);
var _right = new Vector3(-1,0,0);

function Entity() {
    this.transform = new Transform();
    this.components = {};
}

Entity.prototype.addComponent = function (component) {
    if (component.entity) {
        var name = component.constructor.name.toLowerCase();
        throw new TypeError(
            "Component \'" + name + "\' is owned by another entity.");
    }
    component.entity = this;
    var name = component.constructor.name.toLowerCase();
    this.components[name.replace('component', '')] = component;
};

Entity.prototype.update = function (elapsed) {
    for (var name in this.components) {
        if (!this.components[name].enabled) {
            continue;
        }
        this.components[name].update(elapsed);
    }
};

Entity.prototype.draw = function () {
    for (var name in this.components) {
        if (!this.components[name].visible) {
            continue;
        }
        this.components[name].draw();
    }
};

function Transform() {
    this.scaling = new Matrix();
    this.rotation = new Matrix();
    this._position = new Vector3();
    this._parent = null;
    this._local = new Matrix();
    this._world = new Matrix();
    this._forward = new Vector3();
    this._up = new Vector3();
    this._right = new Vector3();
}

Transform.prototype.parent = function(parent) {
    if (parent instanceof Transform) {
        this._parent = parent;
    } else if (parent instanceof Entity) {
        this._parent = parent.transform;
    } else {
        return this._parent;
    }
};

Transform.prototype.world = function() {
    if (!this._parent) {
        return this._local;
    }
    var parent = this._parent.world();
    return parent.multiply(this._local, this._world);
};

Transform.prototype.translate = function(x, y, z) {
    this._local.translate(x,y,z);
};

Transform.prototype.rotate = function(x, y, z) {
    this._local.rotate(x,y,z);
    this.rotation.rotate(x,y,z);
};

Transform.prototype.scale = function(x, y, z) {
    this._local.scale(x,y,z);
    this.scaling.scale(x,y,z);
};

Transform.prototype.position = function(x, y, z) {
    if (arguments.length === 0) {
        return this._position.set(
            this._local[12], this._local[13], this._local[14]);
    } else if (arguments.length === 1) {
        this._local[12] = arguments[0][0];
        this._local[13] = arguments[0][1];
        this._local[14] = arguments[0][2];
    } else if (arguments.length === 3) {
        this._local[12] = x;
        this._local[13] = y;
        this._local[14] = z;
    } else {
        throw new TypeError('Wrong number of arguments.');
    }
};

Transform.prototype.move = function(x, y, z) {
    if (arguments.length === 1) {
        this._local[12] += arguments[0][0];
        this._local[13] += arguments[0][1];
        this._local[14] += arguments[0][2];
    } else if (arguments.length === 3) {
        this._local[12] += x;
        this._local[13] += y;
        this._local[14] += z;
    } else {
        throw new TypeError('Wrong number of arguments.');
    }
};

Transform.prototype.forward = function() {
    this._forward = _forward.transform(this.rotation, this._forward);
    return this._forward.normalize(this._forward);
};

Transform.prototype.up = function() {
    this._up = _up.transform(this.rotation, this._up);
    return this._up.normalize(this._up);
};

Transform.prototype.right = function() {
    this._right = _right.transform(this.rotation, this._right);
    return this._right.normalize(this._right);
};

function Component() {
    this.enabled = true;
    this.visible = true;
}

Component.prototype.update = function(elapsed) {
};

Component.prototype.draw = function() {
};

module.exports.Entity = Entity;
module.exports.Transform = Transform;
module.exports.Component = Component;