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

BoundingBox.prototype.intersectsBox = function(box, separate) {
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
    if (separate !== undefined) {
        var left = box._min[0] - this._max[0];
        var right = box._max[0] - this._min[0];
        var top = box._min[1] - this._max[1];
        var bottom = box._max[1] - this._min[1];
        var front = box._min[2] - this._max[2];
        var back = box._max[2] - this._min[2];

        if (Math.abs(left) < right) {
            separate[0] = left;
        } else {
            separate[0] = right;
        }
        if (Math.abs(top) < bottom) {
            separate[1] = top;
        } else {
            separate[1] = bottom;
        }
        if (Math.abs(front) < back) {
            separate[2] = front;
        } else {
            separate[2] = back;
        }
        if (Math.abs(separate[0]) < Math.abs(separate[1])) {
            if (Math.abs(separate[0]) < Math.abs(separate[2])) {
                separate[2] = 0;
            } else {
                separate[0] = 0;
            }
            separate[1] = 0;
        } else {
            if (Math.abs(separate[1]) < Math.abs(separate[2])) {
                separate[2] = 0;
            } else {
                separate[0] = 0;
            }
            separate[0] = 0;
        }
    }
    return true;
};

BoundingBox.prototype.intersectsSphere = function(sphere) {
    var closestPoint = this.closestPointTo(sphere.center());
    var squaredDistance = vec3.squaredDistance(sphere.center(), closestPoint);
    return squaredDistance < sphere.radius*sphere.radius
};

BoundingBox.prototype.minTranslationDistanceSphere = function(sphere) {
    var closestPoint = this.closestPointTo(sphere.center());
    var direction = vec3.sub(vec3.create(), closestPoint, sphere.center());
    vec3.normalize(direction, direction);
    var distance = vec3.distance(closestPoint, sphere.center());
    return vec3.scale(vec3.create(), direction, sphere.radius - distance);
};

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

BoundingSphere.prototype.intersectsBox = function(box) {
    return box.intersectsSphere(this);
};

BoundingSphere.prototype.intersectsSphere = function(sphere) {
    var squaredRadius =
        (sphere.radius + this.radius) * (sphere.radius + this.radius);
    var squaredDistance = vec3.squaredDistance(this._center, sphere._center);
    return squaredDistance < squaredRadius;
};

BoundingSphere.prototype.minTranslationDistanceSphere = function(sphere) {
    var direction = vec3.sub(
        vec3.create(), this._center, sphere._center);
    var length = vec3.length(direction);
    return vec3.scale(vec3.create(),
        direction, ((this.radius + sphere.radius)-length)/length);
};

function BoxSphereCollision(a, b) {
    this.a = a;
    this.b = b;
}

function SphereSphereCollision(a, b) {
    this.a = a;
    this.b = b;
}

var defaultCollisionHandler = function(collision)  {
    var mtd;
    if (collision instanceof BoxSphereCollision) {
        mtd = collision.a.box.minTranslationDistanceSphere(
            collision.b.sphere);
    } else if (collision instanceof SphereSphereCollision) {
        mtd = collision.a.sphere.minTranslationDistanceSphere(
            collision.b.sphere);
    }

    var im1;
    var im2;

    if (collision.a.mass > 0) {
        im1 = 1 / collision.a.mass;
    }
    if (collision.b.mass > 0) {
        im2 = 1 / collision.b.mass;
    }

    // Push-pull objects apart based off their mass.

    var pos1 = collision.a.entity.position();
    vec3.add(pos1, pos1, vec3.scale(vec3.create(), mtd, im1 / (im1 + im2)));
    collision.a.entity.position(pos1);

    var pos2 = collision.b.entity.position();
    vec3.sub(pos2, pos2, vec3.scale(vec3.create(), mtd, im2 / (im1 + im2)));
    collision.b.entity.position(pos2);
};

function BoxColliderComponent(size, mass, collisionHandler) {
    this.box = new BoundingBox();
    this.collisionHandler = collisionHandler || defaultCollisionHandler;
    this.size = size;
    this.mass = mass || 0;
}

utils.extend(BoxColliderComponent, Component);

BoxColliderComponent.prototype.update = function() {
    var p = this.entity.position();
    // Update the bounds for the box.
    this.box.min(vec3.fromValues(
        p[0]-this.size[0]/2, p[1]-this.size[1]/2, p[2]-this.size[2]/2));
    this.box.max(vec3.fromValues(
        p[0]+this.size[0]/2, p[1]+this.size[1]/2, p[2]+this.size[2]/2));
};

BoxColliderComponent.prototype.detectCollision = function(entity) {
    var boxCollider = entity.components.boxcollider;
    if (boxCollider) {
        var separate = vec3.create();
        if (this.box.intersectsBox(boxCollider.box, separate)) {
            this.collisionHandler(this, boxCollider);
            return;
        }
    }
    var sphereCollider = entity.components.spherecollider;
    if (sphereCollider) {
        var separate = vec3.create();
        if (this.box.intersectsSphere(sphereCollider.sphere, separate)) {
            var collision = new BoxSphereCollision(this, sphereCollider);
            this.collisionHandler(collision);
            return;
        }
    }
};

function SphereColliderComponent(radius, mass, collisionHandler) {
    this.sphere = new BoundingSphere(radius);
    this.collisionHandler = collisionHandler || defaultCollisionHandler;
    this.mass = mass || 0;
}

utils.extend(SphereColliderComponent, Component);

SphereColliderComponent.prototype.update = function() {
    this.sphere.center(this.entity.position());
};

SphereColliderComponent.prototype.detectCollision = function(entity) {
    var boxCollider = entity.components.boxcollider;
    if (boxCollider) {
        var separate = vec3.create();
        if (this.sphere.intersectsBox(boxCollider.box, separate)) {
            this.collisionHandler(this.entity, entity, separate);
            return;
        }
    }
    var sphereCollider = entity.components.spherecollider;
    if (sphereCollider) {
        var separate = vec3.create();
        if (this.sphere.intersectsSphere(sphereCollider.sphere, separate)) {
            var collision = new SphereSphereCollision(this, sphereCollider);
            this.collisionHandler(collision);
            return;
        }
    }
};

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
module.exports.BoxSphereCollision = BoxSphereCollision;
module.exports.SphereSphereCollision = SphereSphereCollision;
module.exports.CollisionManager = CollisionManager;