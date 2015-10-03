var vec3 = require('/gl-matrix/vec3.js');
var mat4 = require('/gl-matrix/mat4.js');

function Vector3(x, y, z) {
    this[0] = x || 0;
    this[1] = y || 0;
    this[2] = z || 0;
}

Vector3.prototype = new Float32Array(3);

Vector3.prototype.x = function(x) {
    if (x === undefined) {
        return this[0];
    }
    this[0] = x;
};

Vector3.prototype.y = function(y) {
    if (y === undefined) {
        return this[1];
    }
    this[1] = y;
};

Vector3.prototype.z = function(z) {
    if (z === undefined) {
        return this[2];
    }
    this[2] = z;
};

Vector3.prototype.set = function(x, y, z) {
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
};

Vector3.prototype.add = function(vector3, result) {
    return vec3.add(result || new Vector3(), this, vector3);
};

Vector3.prototype.subtract = function(vector3, result) {
    return vec3.sub(result || new Vector3(), this, vector3);
};

Vector3.prototype.sub = Vector3.prototype.subtract;

Vector3.prototype.multiply = function(vector3, result) {
    return vec3.mul(result || new Vector3(), this, vector3);
};

Vector3.prototype.mul = Vector3.prototype.multiply;

Vector3.prototype.dot = function(vector3) {
    return vec3.dot(this, vector3);
};

Vector3.prototype.cross = function(vector3, result) {
    return vec3.cross(result || new Vector3(), this, vector3);
};

Vector3.prototype.scale = function(value, result) {
    return vec3.scale(result || new Vector3(), this, value);
};

Vector3.prototype.transform = function(value, result) {
    return vec3.transformMat4(result || new Vector3(), this, value);
};

Vector3.prototype.negate = function(result) {
    return vec3.negate(result || new Vector3(), this);
};

Vector3.prototype.lerp = function(vector3, t, result) {
    return vec3.lerp(result || new Vector3(), vector3, this, t);
};

Vector3.prototype.normalize = function(result) {
    return vec3.normalize(result || new Vector3(), this);
};

Vector3.prototype.len = function() {
    return vec3.length(this);
};


Vector3.prototype.squaredDistance = function(vector3) {
    return vec3.squaredDistance(this, vector3);
};

Vector3.prototype.toString = function() {
    return vec3.str(this);
};

function Matrix() {
    //mat4.identity(this);
    var mat = mat4.create();
    mat.__proto__ = Matrix.prototype;
    return mat;
}

Matrix.prototype = new Float32Array(16);

Matrix.prototype.set = function(value) {
    return mat4.copy(this, value);
};

Matrix.prototype.translate = (function() {
    var _translate = new Vector3();

    return function(x, y, z) {
        _translate.set(x,y,z);
        mat4.translate(this, this, _translate);
        return this;
    }
})();

Matrix.prototype.rotate = function(x, y, z) {
    mat4.rotateX(this, this, x);
    mat4.rotateY(this, this, y);
    mat4.rotateZ(this, this, z);
};

Matrix.prototype.scale = (function() {
    var _scale = new Vector3();

    return function(x, y, z) {
        _scale.set(x,y,z);
        mat4.scale(this, this, _scale);
        return this;
    }
})();

Matrix.prototype.multiply = function(matrix, result) {
    return mat4.multiply(result || new Matrix(), this, matrix);
};

Matrix.prototype.invert = function(result) {
    return mat4.invert(this, result || new Matrix());
};

Matrix.prototype.toString = function() {
    return mat4.str(this);
};

module.exports.Vector3 = Vector3;
module.exports.Matrix = Matrix;