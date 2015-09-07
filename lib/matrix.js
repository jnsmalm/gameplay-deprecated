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
    this[0] = x;
    this[1] = y;
    this[2] = z;
};

Vector3.prototype.add = function(vector3) {
    vec3.add(this, this, vector3);
};

Vector3.add = function(a, b, result) {
    return vec3.add(result || new Vector3(), a, b);
};

Vector3.prototype.scale = function(value) {
    vec3.scale(this, this, value);
};

Vector3.prototype.normalize = function() {
    vec3.normalize(this, this);
};

Vector3.normalize = function(value, result) {
    return vec3.normalize(result || new Vector3(), value);
};

module.exports.Vector3 = Vector3;