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

var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');

var _forward = vec3.fromValues(0,0,1);
var _up = vec3.fromValues(0,1,0);
var _right = vec3.fromValues(-1,0,0);

function Entity(){
    this.components = {};
    this.children = [];
    this.transform = mat4.create();
    this.rotation = mat4.create();
    this._forward = vec3.clone(_forward);
    this._up = vec3.clone(_up);
    this._right = vec3.clone(_right);
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

Entity.prototype.addChild = function (entity) {
    if (entity.parent) {
        entity.parent.removeChild(entity);
    }
    this.children.push(entity);
    entity.parent = this;
};

Entity.prototype.removeChild = function (entity) {
    var index = this.children.indexOf(entity);
    if (index === -1) {
        return;
    }
    this.children.splice(index, 1);
    entity.parent = null;
};

Entity.prototype.update = function (elapsed) {
    for (var name in this.components) {
        this.components[name].update(elapsed);
    }
    for (var i=0; i<this.children.length; i++) {
        this.children[i].update(elapsed);
    }
};

Entity.prototype.draw = function () {
    for (var name in this.components) {
        this.components[name].draw();
    }
    for (var i=0; i<this.children.length; i++) {
        this.children[i].draw();
    }
};

Entity.prototype.translate = function(x, y, z) {
    if (arguments.length === 1) {
        mat4.translate(this.transform, this.transform, arguments[0]);
    } else if (arguments.length === 3) {
        mat4.translate(this.transform, this.transform, vec3.fromValues(x,y,z));
    } else {
        throw new TypeError('Wrong number of arguments.');
    }
};

Entity.prototype.rotate = function(x, y, z) {
    if (arguments.length === 1) {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    } else if (arguments.length !== 3) {
        throw new TypeError('Wrong number of arguments.');
    }
    mat4.rotateX(this.transform, this.transform, x);
    mat4.rotateY(this.transform, this.transform, y);
    mat4.rotateZ(this.transform, this.transform, z);
    mat4.rotateX(this.rotation, this.rotation, x);
    mat4.rotateY(this.rotation, this.rotation, y);
    mat4.rotateZ(this.rotation, this.rotation, z);
    vec3.transformMat4(this._forward, _forward, this.rotation);
    vec3.normalize(this._forward, this._forward);
};

Entity.prototype.scale = function(x, y, z) {
    if (arguments.length === 1) {
        mat4.scale(this.transform, this.transform, arguments[0]);
    } else if (arguments.length === 3) {
        mat4.scale(this.transform, this.transform, vec3.fromValues(x,y,z));
    } else {
        throw new TypeError('Wrong number of arguments.');
    }
};

Entity.prototype.position = function(x, y, z) {
    if (arguments.length === 0) {
        return vec3.fromValues(
            this.transform[12], this.transform[13], this.transform[14]);
    } else if (arguments.length === 1) {
        this.transform[12] = arguments[0][0];
        this.transform[13] = arguments[0][1];
        this.transform[14] = arguments[0][2];
    } else if (arguments.length === 3) {
        this.transform[12] = x;
        this.transform[13] = y;
        this.transform[14] = z;
    } else {
        throw new TypeError('Wrong number of arguments.');
    }
};

Entity.prototype.forward = function() {
    return this._forward;
};

Entity.prototype.right = function() {
    vec3.transformMat4(this._right, _right, this.rotation);
    return vec3.normalize(this._right, this._right);
};

Entity.prototype.up = function() {
    vec3.cross(this._up, this.right(), this._forward);
    return vec3.normalize(this._up, this._up);
};

Entity.prototype.getTransform = function() {
    if (!this.parent) {
        return this.transform;
    }
    return mat4.multiply(
        mat4.create(), this.parent.getTransform(), this.transform);
};

function Component() {
}

Component.prototype.update = function(elapsed) {
};

Component.prototype.draw = function() {
};

module.exports.Entity = Entity;
module.exports.Component = Component;