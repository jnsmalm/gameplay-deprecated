var vec3 = require('/gl-matrix/vec3.js');

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

Vector3.prototype.scale = function(value, result) {
    return vec3.scale(result || new Vector3(), this, value);
};

Vector3.prototype.normalize = function(result) {
    return vec3.normalize(result || new Vector3(), this);
};

Vector3.prototype.toString = function() {
    return vec3.str(this);
};

module.exports.Vector3 = Vector3;