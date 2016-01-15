var Utils = require('/utils.js').Utils;
var Quaternion = require('/math.js').Quaternion;
var Vector3 = require('/math.js').Vector3;
var Matrix = require('/math.js').Matrix;

var _forward = new Vector3(0,0,1);
var _up = new Vector3(0,1,0);
var _right = new Vector3(-1,0,0);

function Transform() {
    var self = this;

    this._localScale = new Vector3(1,1,1);
    this._localRotation = new Quaternion();
    this._parent = null;
    this._local = new Matrix();
    this._forward = new Vector3();
    this._up = new Vector3();
    this._right = new Vector3();

    Object.defineProperty(this, 'localPosition', {
        get: (function() {
            var _localPosition = new Vector3();

            return function() {
                return _localPosition.set(
                    self._local[12], self._local[13], self._local[14]);
            }
        })(),
        set: function(value) {
            self._local[12] = value[0];
            self._local[13] = value[1];
            self._local[14] = value[2];
        }
    });

    Object.defineProperty(this, 'position', {
        get: (function() {
            var _position = new Vector3();

            return function() {
                _position.set(
                    self._local[12], self._local[13], self._local[14]);
                if (!self._parent) {
                    return _position;
                }
                return _position.transform(self._parent.world, _position);
            }
        })(),
        set: (function() {
            var _inverted = new Matrix();
            var _position = new Vector3();

            return function(value) {
                if (!self._parent) {
                    self._local[12] = value[0];
                    self._local[13] = value[1];
                    self._local[14] = value[2];
                } else {
                    // Convert world space to local.
                    self._parent.world.invert(_inverted);
                    value.transform(_inverted, _position);
                    self._local[12] = _position[0];
                    self._local[13] = _position[1];
                    self._local[14] = _position[2];
                }
            }
        })()
    });

    Object.defineProperty(this, 'localRotation', {
        get: function() {
            return self._localRotation;
        },
        set: (function() {
            var _diff = new Vector3();

            return function(value) {
                value.eulerAngles.sub(self._localRotation.eulerAngles, _diff);
                self.rotate(_diff[0], _diff[1], _diff[2]);
            }
        })()
    });

    Object.defineProperty(this, 'rotation', {
        get: (function() {
            var _rotation = new Quaternion();

            return function() {
                if (!self._parent) {
                    return self._localRotation;
                }
                return self._parent.rotation.mul(
                    self._localRotation, _rotation);
            }
        })()
    });

    Object.defineProperty(this, 'localScale', {
        get: function() {
            return self._localScale;
        },
        set: (function() {
            var _diff = new Vector3();

            return function(value) {
                value.div(self._localScale, _diff);
                self.scale(_diff[0], _diff[1], _diff[2]);
            }
        })()
    });

    Object.defineProperty(this, 'scaling', {
        get: (function() {
            var _scaling = new Vector3();

            return function() {
                if (!self._parent) {
                    return self._localScale;
                }
                return self._parent.scaling.mul(
                    self._localScale, _scaling);
            }
        })()
    });

    Object.defineProperty(this, 'eulerAngles', {
        get: function() {
            return self.rotation.eulerAngles;
        }
    });

    Object.defineProperty(this, 'world', {
        get: (function() {
            var _world = new Matrix();

            return function() {
                if (!self._parent) {
                    return self._local;
                }
                return self._parent.world.multiply(
                    self._local, _world);
            }
        })()
    });

}

Transform.prototype.parent = function(parent) {
    if (parent instanceof Transform) {
        this._parent = parent;
    } else if (parent instanceof Entity) {
        this._parent = parent.transform;
    } else if (parent === null) {
        this._parent = null;
    } else {
        return this._parent;
    }
};

Transform.prototype.translate = function(x, y, z) {
    this._local.translate(x,y,z);
};

Transform.prototype.rotate = function(x, y, z) {
    this._local.rotate(x,y,z);
    this._localRotation.rotateX(x);
    this._localRotation.rotateY(y);
    this._localRotation.rotateZ(z);
};

Transform.prototype.scale = (function() {
    var _scale = new Vector3();

    return function(x, y, z) {
        this._local.scale(x,y,z);
        _scale.set(x,y,z);
        this._localScale.mul(_scale, this._localScale);
    }
})();

Transform.prototype.move = (function() {
    var _move = new Vector3();

    return function(x, y, z) {
        if (arguments.length === 1) {
            _move.set(arguments[0]);
            this.position = this.position.add(_move, _move);
        } else if (arguments.length === 3) {
            _move.set(x,y,z);
            this.position = this.position.add(_move, _move);
        } else {
            throw new TypeError('Wrong number of arguments.');
        }
    }
})();

Transform.prototype.forward = function() {
    this._forward = _forward.transform(this._localRotation, this._forward);
    return this._forward.normalize(this._forward);
};

Transform.prototype.up = function() {
    this._up = _up.transform(this._localRotation, this._up);
    return this._up.normalize(this._up);
};

Transform.prototype.right = function() {
    this._right = _right.transform(this._localRotation, this._right);
    return this._right.normalize(this._right);
};

module.exports.Transform = Transform;