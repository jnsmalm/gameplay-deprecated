var vec2 = require('/gl-matrix/vec2.js');
var vec3 = require('/gl-matrix/vec3.js');
var vec4 = require('/gl-matrix/vec4.js');
var mat4 = require('/gl-matrix/mat4.js');
var quat = require('/gl-matrix/quat.js');

function Vector2(x, y) {
    var vec = vec2.fromValues(x||0, y||0);
    vec.__proto__ = Vector2.prototype;
    return vec;
}

Vector2.prototype = new Float32Array(2);

function Vector3(x, y, z) {
    var vec = vec3.fromValues(x||0, y||0, z||0);
    vec.__proto__ = Vector3.prototype;
    return vec;
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

Vector3.prototype.divide = function(vector3, result) {
    return vec3.divide(result || new Vector3(), this, vector3);
};

Vector3.prototype.div = Vector3.prototype.divide;

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
    if (value instanceof Matrix) {
        return vec3.transformMat4(result || new Vector3(), this, value);
    }
    if (value instanceof Quaternion) {
        return vec3.transformQuat(result || new Vector3(), this, value);
    }
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

function Vector4(x, y, z, w) {
    var vec = vec4.fromValues(x||0, y||0, z||0, w||0);
    vec.__proto__ = Vector4.prototype;
    return vec;
}

Vector4.prototype = new Float32Array(4);

function Matrix() {
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
    return mat4.invert(result || new Matrix(), this);
};

Matrix.prototype.toString = function() {
    return mat4.str(this);
};

Matrix.perspective = function(fieldOfView, aspectRatio, near, far, result) {
    return mat4.perspective(
        result || new Matrix(), fieldOfView, aspectRatio, near, far);
};

Matrix.ortho = function(left, right, bottom, top, near, far, result) {
    return mat4.ortho(
        result || new Matrix(), left, right, bottom, top, near, far);
};

Matrix.lookAt = function(eye, center, up, result) {
    return mat4.lookAt(result || new Matrix(), eye, center, up);
};

function Quaternion() {
    quat.identity(this);

    Object.defineProperty(this, 'eulerAngles', {
        get: (function() {
            var _result = new Vector3();

            // Found the implementation at gamedev.stackexchange.com
            // Organizing a Transform class to internally use quaternions.

            return function() {
                var x = this[0];
                var y = this[1];
                var z = this[2];
                var w = this[3];
                var roll = Math.atan2(2*(x*y+z*w),(1-2*(y*y+z*z)));
                var pitch = Math.asin(2*(x*z-w*y));
                var yaw = Math.atan2(2*(x*w+y*z),(1-2*(z*z+w*w)));
                _result.set(pitch,yaw,roll);
                return _result;
            }
        })(),
        set: function(value) {
            var halfPitch = value[0] * 0.5;
            var sinPitch = Math.sin(halfPitch);
            var cosPitch = Math.cos(halfPitch);

            var halfYaw = value[1] * 0.5;
            var sinYaw = Math.sin(halfYaw);
            var cosYaw = Math.cos(halfYaw);

            var halfRoll = value[2] * 0.5;
            var sinRoll = Math.sin(halfRoll);
            var cosRoll = Math.cos(halfRoll);

            this[0] = ((cosYaw * sinPitch) * cosRoll) + ((sinYaw * cosPitch) * sinRoll);
            this[1] = ((sinYaw * cosPitch) * cosRoll) - ((cosYaw * sinPitch) * sinRoll);
            this[2] = ((cosYaw * cosPitch) * sinRoll) - ((sinYaw * sinPitch) * cosRoll);
            this[3] = ((cosYaw * cosPitch) * cosRoll) + ((sinYaw * sinPitch) * sinRoll);
        }
    });
}

Quaternion.prototype = new Float32Array(4);

Quaternion.prototype.rotateX = function(value) {
    return quat.rotateX(this, this, value);
};

Quaternion.prototype.rotateY = function(value) {
    return quat.rotateY(this, this, value);
};

Quaternion.prototype.rotateZ = function(value) {
    return quat.rotateZ(this, this, value);
};

Quaternion.prototype.add = function(value, result) {
    return quat.add(result || new Quaternion(), this, value);
};

Quaternion.prototype.mul = function(value, result) {
    return quat.mul(result || new Quaternion(), this, value);
};

Quaternion.prototype.invert = function(result) {
    return quat.invert(result || new Quaternion(), this);
};

Quaternion.prototype.toString = function() {
    return quat.str(this);
};

module.exports.Vector2 = Vector2;
module.exports.Vector3 = Vector3;
module.exports.Vector4 = Vector4;
module.exports.Matrix = Matrix;
module.exports.Quaternion = Quaternion;