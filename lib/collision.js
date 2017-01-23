/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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
"use strict";
const transform_1 = require("./transform");
const math_1 = require("./math");
const utils_1 = require("./utils");
const vector = new utils_1.Pool(math_1.Vector3, 20);
const quaternion = new utils_1.Pool(math_1.Quaternion, 5);
const matrix = new utils_1.Pool(math_1.Matrix4, 5);
class Projection {
    /**
     * Creates a new projection with given min, max.
     */
    constructor(min = 0, max = 0) {
        this.min = min;
        this.max = max;
    }
    /**
     * Returns the overlap of the two projections.
     */
    getOverlap(p) {
        if (this.min < p.min) {
            return p.min - this.max;
        }
        else {
            return this.min - p.max;
        }
    }
}
exports.Projection = Projection;
/**
 * Represents a shape for use with the Separating Axis Theorem (SAT).
 */
class Shape {
    constructor() {
        this.points = [];
        this.radius = 0;
        this.center = new math_1.Vector3();
        this.normals = [];
    }
    /**
     * Projects the shape onto the given axis.
     * @param axis Normalized axis.
     */
    project(axis) {
        let dot = this.points[0].dot(axis);
        let min = dot;
        let max = dot;
        for (let i = 1; i < this.points.length; i++) {
            // NOTE: The axis must be normalized to get accurate projections.
            dot = this.points[i].dot(axis);
            min = Math.min(dot, min);
            max = Math.max(dot, max);
        }
        return new Projection(min - this.radius, max + this.radius);
    }
    /**
     * Returns true if the shapes are intersecting.
     * @param axes Normalized axes.
     * @param mtv Minumum translation vector, used for collision response.
     */
    static isIntersecting(a, b, axes, mtv) {
        let overlap = Number.MAX_VALUE;
        let smallest = null;
        for (let axis of axes) {
            let p1 = a.project(axis);
            let p2 = b.project(axis);
            if (p1.getOverlap(p2) >= 0) {
                // Then we can guarantee that the shapes do not overlap.
                return false;
            }
            let o = Math.abs(p1.getOverlap(p2));
            if (o < overlap) {
                overlap = o;
                smallest = axis;
            }
        }
        if (mtv) {
            smallest.copy(mtv);
            let d = a.center.subtract(b.center, vector.next);
            if (d.dot(mtv) < 0) {
                mtv.negate(mtv);
            }
            mtv.scale(overlap, mtv);
        }
        // If we get here then we know that every axis had overlap on it so we 
        // can guarantee an intersection.
        return true;
    }
}
exports.Shape = Shape;
/**
 * Represents a box shape used for intersection tests.
 */
class Box extends Shape {
    /**
     * Creates a new box.
     */
    constructor() {
        super();
        this.extents = new math_1.Vector3();
        for (let i = 0; i < 8; i++) {
            this.points.push(new math_1.Vector3());
        }
        for (let i = 0; i < 3; i++) {
            this.normals.push(new math_1.Vector3());
        }
    }
    /**
     * Returns the point closest to the given point.
     */
    getClosestPoint(point, out = new math_1.Vector3()) {
        let diff = point.subtract(this.center, vector.next);
        out.xyz(0, 0, 0);
        for (var i = 0; i < 3; i++) {
            var dist = diff.dot(this.normals[i]);
            if (dist > this.extents[i]) {
                dist = this.extents[i];
            }
            if (dist < -this.extents[i]) {
                dist = -this.extents[i];
            }
            out.add(this.normals[i].scale(dist), out);
        }
        return out;
    }
}
exports.Box = Box;
/**
 * Represents a collider shaped as a sphere.
 */
class SphereCollider {
    /**
     * Creates a new sphere collider.
     */
    constructor(radius, transform = new transform_1.Transform()) {
        this.radius = radius;
        this.transform = transform;
        this.sphere = new Shape();
        this.sphere.points.push(new math_1.Vector3());
    }
    /**
     * Attaches the collider to a transform.
     */
    attach(transform) {
        this.transform.parent = transform;
    }
    /**
     * Updates the collider to be able to perform collision tests.
     */
    update() {
        let position = this.transform.getPosition(vector.next);
        let scaling = this.transform.getScaling(vector.next);
        // For a sphere the center and the single point is the same.
        position.copy(this.sphere.center);
        position.copy(this.sphere.points[0]);
        // We need to multiply the radius with the scaling. We must choose a 
        // single component of the scaling, we choose the 'x' component.
        this.sphere.radius = this.radius * scaling[0];
    }
    /**
     * Returns true if the two colliders are colliding.
     */
    isColliding(collider, mtv) {
        if (collider instanceof SphereCollider) {
            return SAT.sphereToSphere(this.sphere, collider.sphere, mtv);
        }
        if (collider instanceof BoxCollider) {
            return SAT.sphereToBox(this.sphere, collider.box, mtv);
        }
    }
}
exports.SphereCollider = SphereCollider;
/**
 * Represents a collider shaped as a box.
 */
class BoxCollider {
    /**
     * Creates a new box collider.
     */
    constructor(extents, transform = new transform_1.Transform()) {
        this.extents = extents;
        this.transform = transform;
        this.box = new Box();
    }
    /**
     * Attaches the collider to a transform.
     */
    attach(transform) {
        this.transform.parent = transform;
    }
    /**
     * Updates the box collider.
     */
    update() {
        this.transform.getPosition(this.box.center);
        this.extents.multiply(this.transform.getScaling(vector.next), this.box.extents);
        let world = this.transform.getWorldMatrix(matrix.next);
        let rotation = this.transform.getRotation(quaternion.next);
        for (let i = 0; i < 8; i++) {
            let point = this.box.points[i];
            for (let j = 0; j < 3; j++) {
                point[j] = this.extents[j] * BoxCollider.points[i * 3 + j];
            }
            point.transform(world, point);
        }
        this.box.normals[0].xyz(1, 0, 0);
        this.box.normals[1].xyz(0, 1, 0);
        this.box.normals[2].xyz(0, 0, 1);
        for (let normal of this.box.normals) {
            normal.transform(rotation, normal);
            normal.normalize(normal);
        }
    }
    /**
     * Returns true if the colliders are colliding.
     */
    isColliding(collider, mtv) {
        if (collider instanceof BoxCollider) {
            return SAT.boxToBox(this.box, collider.box, mtv);
        }
        if (collider instanceof SphereCollider) {
            return SAT.boxToSphere(this.box, collider.sphere, mtv);
        }
    }
}
BoxCollider.points = [
    -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1,
    -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1
];
exports.BoxCollider = BoxCollider;
/**
 * The Separating Axis Theorem, SAT for short, is a method to determine if two
 * convex shapes are intersecting.
 */
var SAT;
(function (SAT) {
    /**
     * Returns true if the spheres are intersecting.
     */
    function sphereToSphere(a, b, mtv) {
        let axes = [];
        // For two spheres there is only one axis test
        let axis = a.center.subtract(b.center, vector.next);
        axes.push(axis.normalize(axis));
        return Shape.isIntersecting(a, b, axes, mtv);
    }
    SAT.sphereToSphere = sphereToSphere;
    /**
     * Returns true if the boxes are intersecting.
     */
    function boxToBox(a, b, mtv) {
        let axes = [];
        // The first 6 axes (from the face normals) are used to check if there 
        // is a corner of one object intersecting a face of the other object.
        axes.push(...a.normals, ...b.normals);
        // The set of 9 axes formed by the cross products of edges are used to 
        // consider edge on edge collision detection, where there is not a 
        // vertex penetrating the other object.
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                let c = a.normals[i].cross(b.normals[j], vector.next);
                if (c.sqrMagnitude === 0) {
                    continue;
                }
                axes.push(c.normalize(c));
            }
        }
        return Shape.isIntersecting(a, b, axes, mtv);
    }
    SAT.boxToBox = boxToBox;
    /**
     * Returns true if the box is intersecting the sphere.
     */
    function boxToSphere(a, s, mtv) {
        let axes = [];
        // When testing box with sphere using SAT, the only axis that needs to
        // be tested goes from center of sphere to closest point on box.
        let point = a.getClosestPoint(s.center, vector.next);
        point.add(a.center, point).subtract(s.center, point);
        axes.push(point.normalize(point));
        return Shape.isIntersecting(a, s, axes, mtv);
    }
    SAT.boxToSphere = boxToSphere;
    /**
     * Returns true if the sphere is intersecting the box.
     */
    function sphereToBox(s, b, mtv) {
        let axes = [];
        // When testing box with sphere using SAT, the only axis that needs to
        // be tested goes from center of sphere to closest point on box.
        let point = b.getClosestPoint(s.center, vector.next);
        point.add(b.center, point).subtract(s.center, point);
        axes.push(point.normalize(point));
        return Shape.isIntersecting(s, b, axes, mtv);
    }
    SAT.sphereToBox = sphereToBox;
})(SAT = exports.SAT || (exports.SAT = {}));
class CollisionManager {
    /**
     * Creates a new collision manager.
     * @param onCollision Callback when a collsion occur.
     */
    constructor(onCollision) {
        this.onCollision = onCollision;
        this.colliders = [];
    }
    /**
     * Adds a collider.
     */
    addCollider(collider) {
        this.colliders.push(collider);
    }
    /**
     * Updates the collision manager.
     */
    update() {
        let mtv = vector.next;
        for (let i = 0; i < this.colliders.length; i++) {
            let a = this.colliders[i];
            for (let j = i + 1; j < this.colliders.length; j++) {
                let b = this.colliders[j];
                if (a.isColliding(b, mtv)) {
                    this.onCollision(a, b, mtv);
                }
            }
        }
    }
}
exports.CollisionManager = CollisionManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGlzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29sbGlzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFFWCwyQ0FBdUM7QUFDdkMsaUNBQXFEO0FBQ3JELG1DQUE4QjtBQUU5QixNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQUksQ0FBQyxjQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxZQUFJLENBQUMsaUJBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQUksQ0FBQyxjQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFhcEM7SUFDSTs7T0FFRztJQUNILFlBQW9CLE1BQU0sQ0FBQyxFQUFVLE1BQU0sQ0FBQztRQUF4QixRQUFHLEdBQUgsR0FBRyxDQUFJO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBSTtJQUFJLENBQUM7SUFDakQ7O09BRUc7SUFDSCxVQUFVLENBQUMsQ0FBYTtRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDNUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBZkQsZ0NBZUM7QUFFRDs7R0FFRztBQUNIO0lBQUE7UUFDVyxXQUFNLEdBQWMsRUFBRSxDQUFDO1FBQ3ZCLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxXQUFNLEdBQUcsSUFBSSxjQUFPLEVBQUUsQ0FBQztRQUN2QixZQUFPLEdBQWMsRUFBRSxDQUFDO0lBbURuQyxDQUFDO0lBbERH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QUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcs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