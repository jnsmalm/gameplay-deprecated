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

var vec3 = require('/gl-matrix/vec3.js');
var utils = require('/utils.js');
var Component = require('/entity.js').Component;
var Entity = require('/entity.js').Entity;
var Vector3 = require('/matrix.js').Vector3;
var RigidBody = require('/physics.js').RigidBody;

function BoundingBox() {
    this._min = vec3.create();
    this._max = vec3.create();
}

BoundingBox.prototype.min = function(value) {
    if (!value) {
        return this._min;
    }
    vec3.copy(this._min, value);
};

BoundingBox.prototype.max = function(value) {
    if (!value) {
        return this._max;
    }
    vec3.copy(this._max, value);
};

BoundingBox.prototype.closestPointTo = function(p) {
    var r = vec3.create();
    if (p[0] < this._min[0]) {
        r[0] = this._min[0];
    } else if (p[0] > this._max[0]) {
        r[0] = this._max[0];
    } else {
        r[0] = p[0];
    }
    if (p[1] < this._min[1]) {
        r[1] = this._min[1];
    } else if (p[1] > this._max[1]) {
        r[1] = this._max[1];
    } else {
        r[1] = p[1];
    }
    if (p[2] < this._min[2]) {
        r[2] = this._min[2];
    } else if (p[2] > this._max[2]) {
        r[2] = this._max[2];
    } else {
        r[2] = p[2];
    }
    return r;
};

BoundingBox.prototype.contains = function(p) {
    return (p[0] >= this._min[0]) && (p[0] <= this._max[0]) &&
        (p[1] >= this._min[1]) && (p[1] <= this._max[1]) &&
        (p[2] >= this._min[2]) && (p[2] <= this._max[2]);
};

BoundingBox.prototype.intersectsBox = function(box, mtv) {
    if (this._min[0] > box._max[0]) {
        return false;
    }
    if (this._max[0] < box._min[0]) {
        return false;
    }
    if (this._min[1] > box._max[1]) {
        return false;
    }
    if (this._max[1] < box._min[1]) {
        return false;
    }
    if (this._min[2] > box._max[2]) {
        return false;
    }
    if (this._max[2] < box._min[2]) {
        return false;
    }
    if (mtv !== undefined) {
        var left = box._min[0] - this._max[0];
        var right = box._max[0] - this._min[0];
        var top = box._min[1] - this._max[1];
        var bottom = box._max[1] - this._min[1];
        var front = box._min[2] - this._max[2];
        var back = box._max[2] - this._min[2];

        if (Math.abs(left) < right) {
            mtv[0] = left;
        } else {
            mtv[0] = right;
        }
        if (Math.abs(top) < bottom) {
            mtv[1] = top;
        } else {
            mtv[1] = bottom;
        }
        if (Math.abs(front) < back) {
            mtv[2] = front;
        } else {
            mtv[2] = back;
        }
        if (Math.abs(mtv[0]) < Math.abs(mtv[1])) {
            if (Math.abs(mtv[0]) < Math.abs(mtv[2])) {
                mtv[2] = 0;
            } else {
                mtv[0] = 0;
            }
            mtv[1] = 0;
        } else {
            if (Math.abs(mtv[1]) < Math.abs(mtv[2])) {
                mtv[2] = 0;
            } else {
                mtv[0] = 0;
            }
            mtv[0] = 0;
        }
    }
    return true;
};

BoundingBox.prototype.intersectsSphere = function(sphere, mtv) {
    var closestPoint = this.closestPointTo(sphere.center());
    var squaredDistance = vec3.squaredDistance(sphere.center(), closestPoint);
    var collision = squaredDistance < sphere.radius*sphere.radius;
    if (collision) {
        vec3.copy(mtv, this.minTranslationDistanceSphere(sphere));
        return true;
    }
    return false;
};

BoundingBox.prototype.minTranslationDistanceSphere = (function() {
    var _direction = new Vector3();
    var _result = new Vector3();

    return function(sphere) {
        var closestPoint = this.closestPointTo(sphere.center());
        vec3.sub(_direction, closestPoint, sphere.center());
        vec3.normalize(_direction, _direction);
        var distance = vec3.distance(closestPoint, sphere.center());
        return vec3.scale(_result, _direction, sphere.radius - distance);
    }
})();

function BoundingSphere(radius) {
    this._center = vec3.create();
    this.radius = radius || 0;
}

BoundingSphere.prototype.center = function(value) {
    if (value === undefined) {
        return this._center;
    }
    vec3.copy(this._center, value);
};

BoundingSphere.prototype.intersectsBox = function(box, mtv) {
    var collision = box.intersectsSphere(this, mtv);
    if (collision) {
        mtv.negate(mtv);
    }
    return collision;
};

BoundingSphere.prototype.intersectsSphere = function(sphere, mtv) {
    var squaredRadius =
        (sphere.radius + this.radius) * (sphere.radius + this.radius);
    var squaredDistance = vec3.squaredDistance(this._center, sphere._center);
    var collision = squaredDistance < squaredRadius;
    if (collision) {
        vec3.copy(mtv, this.minTranslationDistanceSphere(sphere));
        return true;
    }
    return false;
};

BoundingSphere.prototype.minTranslationDistanceSphere = (function() {
    var _dir = new Vector3();
    var _mtv = new Vector3();

    return function(sphere) {
        _dir = vec3.sub(_dir, this._center, sphere._center);
        var length = vec3.length(_dir);
        return vec3.scale(
            _mtv, _dir, ((this.radius + sphere.radius)-length)/length);
    }
})();

function BoxColliderComponent(options) {
    Component.call(this);
    options = options || {};
    this.box = new BoundingBox();
    this.collisionHandler = options.collisionHandler || function() {};
    this.collisionResolver =
        options.collisionResolver || RigidBody.resolveCollision;
    var size = options.size || vec3.fromValues(1,1,1);
    this.min = vec3.fromValues(-size[0]/2, -size[1]/2, -size[2]/2);
    this.max = vec3.fromValues(size[0]/2, size[1]/2, size[2]/2);
}

utils.extend(BoxColliderComponent, Component);

BoxColliderComponent.prototype.update = function() {
    var transform = this.entity.getTransform();
    vec3.transformMat4(this.box._min, this.min, transform);
    vec3.transformMat4(this.box._max, this.max, transform);
};

BoxColliderComponent.prototype.detectCollision = (function() {
    var _mtv = new Vector3();

    return function(entity) {
        if (!this.enabled) {
            return;
        }
        var boxCollider = entity.components.boxcollider;
        if (boxCollider && boxCollider.enabled) {
            if (this.box.intersectsBox(boxCollider.box, _mtv)) {
                this.collisionHandler(entity);
                boxCollider.collisionHandler(this.entity);
                this.collisionResolver(this.entity, entity, _mtv);
                return;
            }
        }
        var sphereCollider = entity.components.spherecollider;
        if (sphereCollider && sphereCollider.enabled) {
            if (this.box.intersectsSphere(sphereCollider.sphere, _mtv)) {
                this.collisionHandler(entity);
                sphereCollider.collisionHandler(this.entity);
                this.collisionResolver(this.entity, entity, _mtv);
            }
        }
    }
})();

function SphereColliderComponent(options) {
    Component.call(this);
    this.center = vec3.create();
    this.sphere = new BoundingSphere(options.radius || 0.5);
    this.collisionHandler = options.collisionHandler || function() {};
    this.collisionResolver =
        options.collisionResolver || RigidBody.resolveCollision;
}

utils.extend(SphereColliderComponent, Component);

SphereColliderComponent.prototype.update = function() {
    vec3.transformMat4(this.sphere._center, this.center,
        this.entity.getTransform());
};

SphereColliderComponent.prototype.detectCollision = (function() {
    var _mtv = new Vector3();

    return function(entity) {
        if (!this.enabled) {
            return;
        }
        var boxCollider = entity.components.boxcollider;
        if (boxCollider && boxCollider.enabled) {
            if (this.sphere.intersectsBox(boxCollider.box, _mtv)) {
                this.collisionHandler(entity);
                boxCollider.collisionHandler(this.entity);
                this.collisionResolver(this.entity, entity, _mtv);
                return;
            }
        }
        var sphereCollider = entity.components.spherecollider;
        if (sphereCollider && sphereCollider.enabled) {
            if (this.sphere.intersectsSphere(sphereCollider.sphere, _mtv)) {
                this.collisionHandler(entity);
                sphereCollider.collisionHandler(this.entity);
                this.collisionResolver(this.entity, entity, _mtv);
            }
        }
    }
})();

function CollisionManager() {
    Entity.call(this);
}

utils.extend(CollisionManager, Entity);

CollisionManager.detectEntityCollisions =
    function(entity, entities, startIndex) {

    for (var i = startIndex || 0; i < entities.length; i++) {
        if (entity === entities[i]) {
            continue;
        }
        var sphereCollider = entity.components.spherecollider;
        if (sphereCollider) {
            sphereCollider.detectCollision(entities[i]);
            continue;
        }
        var boxCollider = entity.components.boxcollider;
        if (boxCollider) {
            boxCollider.detectCollision(entities[i]);
            continue;
        }
    }
};

CollisionManager.detectCollisions = function(entities) {
    for (var i=0; i<entities.length; i++) {
        CollisionManager.detectEntityCollisions(entities[i], entities, i + 1);
    }
};

CollisionManager.prototype.update = function(elapsed) {
    Entity.prototype.update.call(this, elapsed);
    CollisionManager.detectCollisions(this.children);
};

module.exports.BoundingBox = BoundingBox;
module.exports.BoxColliderComponent = BoxColliderComponent;
module.exports.BoundingSphere = BoundingSphere;
module.exports.SphereColliderComponent = SphereColliderComponent;
module.exports.CollisionManager = CollisionManager;