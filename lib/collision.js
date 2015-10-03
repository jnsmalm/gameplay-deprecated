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
var Component = require('/entity.js').Component;
var Entity = require('/entity.js').Entity;
var Vector3 = require('/matrix.js').Vector3;
var RigidBody = require('/physics.js').RigidBody;

var SAT = {};

SAT.Shape = function Shape(center, points, radius) {
    this.center = center;
    this.points = points;
    // Radius for the shape is really only used when shape is a circle/sphere.
    this.radius = radius || 0;
};

SAT.Shape.prototype.project = function(axis) {
    var dot = axis.dot(this.points[0]);
    var min = dot;
    var max = dot;
    for (var i=0; i<this.points.length; i++) {
        dot = axis.dot(this.points[i]);
        min = Math.min(dot, min);
        max = Math.max(dot, max);
    }
    return {
        min: min - this.radius,
        max: max + this.radius
    };
};

SAT.distance = function(a, b) {
    if (a.min < b.min) {
        return b.min - a.max;
    } else {
        return a.min - b.max;
    }
};

SAT.testAxes = function(axes, shapeA, shapeB) {
    var result = {
        isIntersecting: true,
        minPenetrationDepth: null,
        minPenetrationVector: null
    };
    for (var i=0; i<axes.length; i++) {
        var projA = shapeA.project(axes[i]);
        var projB = shapeB.project(axes[i]);
        var dist = SAT.distance(projA, projB);
        if (dist > 0) {
            result.isIntersecting = false;
            break;
        }
        dist = Math.abs(dist);
        if (!result.minPenetrationDepth || dist < result.minPenetrationDepth) {
            result.minPenetrationDepth = dist;
            result.minPenetrationVector = axes[i];

            var d = shapeA.center.sub(shapeB.center);
            if (d.dot(result.minPenetrationVector) < 0) {
                result.minPenetrationVector =
                    result.minPenetrationVector.negate();
            }
        }
    }
    return result;
};

function BoundingBox(extents) {
    this.center = new Vector3();
    this.extents = extents || new Vector3();
    this.edges = [];
    this.points = [];
    for (var i=0; i<8; i++) {
        this.points.push(new Vector3());
    }
    this.normals = [];
    for (var i=0; i<3; i++) {
        this.normals.push(new Vector3());
    }
}

BoundingBox.prototype.closestPointTo = (function() {
    var _d = new Vector3();

    return function(point, result) {
        if (result) {
            result.set(0,0,0);
        }
        _d = point.sub(this.center, _d);
        var q = result || new Vector3();
        for (var i=0; i<this.normals.length; i++) {
            var dist = _d.dot(this.normals[i]);
            if (dist > this.extents[i]) {
                dist = this.extents[i];
            }
            if (dist < -this.extents[i]) {
                dist = -this.extents[i];
            }
            q.add(this.normals[i].scale(dist), q);
        }
        return q;
    }
})();

BoundingBox.prototype.intersectsBox = function(box, mtv) {
    var normals = this.normals.
        concat(box.normals).
        concat(this.edges).
        concat(box.edges);

    var a = new SAT.Shape(this.center, this.points);
    var b = new SAT.Shape(box.center, box.points);
    var result = SAT.testAxes(normals, a, b);

    if (!result.isIntersecting) {
        return false;
    }

    var min = result.minPenetrationDepth;
    var axis = result.minPenetrationVector;

    mtv.set(axis.normalize().scale(min));

    return true;
};

BoundingBox.prototype.intersectsSphere = (function() {
    var _closestPoint = new Vector3();
    var _axis = new Vector3();

    return function(sphere, mtv) {
        // When testing box with sphere using SAT, the only axis that needs to
        // be tested goes from center of sphere to closest point on box.
        _closestPoint = this.closestPointTo(sphere.center, _closestPoint)
            .add(this.center, _closestPoint);
        _axis = _closestPoint.sub(sphere.center, _axis)
            .normalize(_axis);

        var a = new SAT.Shape(this.center, this.points);
        var b = new SAT.Shape(sphere.center, [sphere.center], sphere.radius);

        var result = SAT.testAxes([_axis], a, b);
        if (!result.isIntersecting) {
            return false;
        }

        mtv.set(result.minPenetrationVector.normalize()
            .scale(result.minPenetrationDepth));

        return true;
    }
})();

function BoundingSphere(radius) {
    this.center = new Vector3();
    this.radius = radius || 0;
}

BoundingSphere.prototype.intersectsBox = function(box, mtv) {
    if (box.intersectsSphere(this, mtv)) {
        mtv.negate(mtv);
        return true;
    }
    return false;
};

BoundingSphere.prototype.intersectsSphere = (function() {
    var _delta = new Vector3();

    return function(sphere, mtv) {
        var sum = sphere.radius + this.radius;
        var isIntersecting =
            this.center.squaredDistance(sphere.center) < sum * sum;
        if (isIntersecting) {
            this.center.sub(sphere.center, _delta);
            var length = _delta.len();
            _delta.scale((sum-length)/length, mtv);
            return true;
        }
        return false;
    }
})();

var emptyCollisionHandler = function() {};

function BoxColliderComponent(options) {
    Component.call(this);

    options = Utils.options(options, this);
    options.value('extents', new Vector3(0.5,0.5,0.5));
    options.value('center', new Vector3());
    options.value('collisionHandler', emptyCollisionHandler);
    options.value('collisionResolver', RigidBody.resolveCollision);

    this.box = new BoundingBox();
}

Utils.extend(BoxColliderComponent, Component);

BoxColliderComponent.prototype.update = (function() {
    var _normals = [
        new Vector3(1,0,0),
        new Vector3(0,1,0),
        new Vector3(0,0,1)
    ];

    return function() {
        var transform = this.entity.transform;
        var world = transform.world();

        this.extents.transform(transform.scaling, this.box.extents);
        this.center.transform(world, this.box.center);

        var x = this.extents.x();
        var y = this.extents.y();
        var z = this.extents.z();

        this.box.points[0].set(-x, y,-z);
        this.box.points[1].set( x, y,-z);
        this.box.points[2].set(-x,-y,-z);
        this.box.points[3].set( x,-y,-z);
        this.box.points[4].set(-x, y, z);
        this.box.points[5].set( x, y, z);
        this.box.points[6].set(-x,-y, z);
        this.box.points[7].set( x,-y, z);

        for (var i=0; i<this.box.points.length; i++) {
            this.box.points[i].transform(world, this.box.points[i]);
        }

        for (var i=0; i<_normals.length; i++) {
            _normals[i].transform(transform.rotation, this.box.normals[i])
                .normalize(this.box.normals[i]);
        }
    }
})();

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

    options = Utils.options(options, this);
    options.value('radius', 0.5);
    options.value('collisionHandler', emptyCollisionHandler);
    options.value('collisionResolver', RigidBody.resolveCollision);

    this.center = new Vector3();
    this.sphere = new BoundingSphere(this.radius);
}

Utils.extend(SphereColliderComponent, Component);

SphereColliderComponent.prototype.update = function() {
    var transform = this.entity.transform;
    this.center.transform(transform.world(), this.sphere.center);
    // Use the x component from the scaling matrix and apply to radius.
    this.sphere.radius = this.radius * transform.scaling[0];
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

Utils.extend(CollisionManager, Entity);

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