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

import { Transform } from "./transform"
import { Vector3, Matrix4, Quaternion } from "./math"
import { Pool } from "./utils"

const vector = new Pool(Vector3, 20);
const quaternion = new Pool(Quaternion, 5);
const matrix = new Pool(Matrix4, 5);

/**
 * Represents an object which can collide with other objects.
 */
export interface Collider<T> {
    /**
     * Returns true if the objects are colliding.
     * @param mtv Minumum translation vector, used for collision response.
     */
    isColliding(collider: T, mtv?: Vector3): boolean;
}

export class Projection {
    /**
     * Creates a new projection with given min, max.
     */
    constructor(private min = 0, private max = 0) { }
    /**
     * Returns the overlap of the two projections.
     */
    getOverlap(p: Projection) {
        if (this.min < p.min) {
            return p.min - this.max;
        } else {
            return this.min - p.max;
        }
    }
}

/**
 * Represents a shape for use with the Separating Axis Theorem (SAT).
 */
export class Shape {
    public points: Vector3[] = [];
    public radius = 0;
    public center = new Vector3();
    public normals: Vector3[] = [];
    /**
     * Projects the shape onto the given axis.
     * @param axis Normalized axis.
     */
    project(axis: Vector3) {
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
    static isIntersecting(a: Shape, b: Shape, axes: Vector3[], mtv?: Vector3) {
        let overlap = Number.MAX_VALUE;
        let smallest: Vector3 = null;

        for (let axis of axes) {
            let p1 = a.project(axis);
            let p2 = b.project(axis);
            if (p1.getOverlap(p2) > 0) {
                // Then we can guarantee that the shapes do not overlap.
                return false;
            }
            let o = Math.abs(p1.getOverlap(p2));
            if (o < overlap && o > 0) {
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

/**
 * Represents a box shape used for intersection tests.
 */
export class Box extends Shape {
    public extents = new Vector3();
    /**
     * Creates a new box.
     */
    constructor() {
        super();
        for (let i = 0; i < 8; i++) {
            this.points.push(new Vector3());
        }
        for (let i = 0; i < 3; i++) {
            this.normals.push(new Vector3());
        }
    }
    /**
     * Returns the point closest to the given point.
     */
    getClosestPoint(point: Vector3, out = new Vector3()) {
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

/**
 * Represents a collider shaped as a sphere.
 */
export class SphereCollider implements Collider<SphereCollider | BoxCollider> {
    public sphere = new Shape();
    /**
     * Creates a new sphere collider.
     */
    constructor(public radius: number, public transform = new Transform()) { 
        this.sphere.points.push(new Vector3());
    }
    /**
     * Attaches the collider to a transform.
     */
    attach(transform: Transform) {
        this.transform = transform;
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
    isColliding(collider: SphereCollider | BoxCollider, mtv?: Vector3) {
        if (collider instanceof SphereCollider) {
            return SAT.sphereToSphere(this.sphere, collider.sphere, mtv);
        }
        if (collider instanceof BoxCollider) {
            return SAT.sphereToBox(this.sphere, collider.box, mtv);
        }
    }
}

/**
 * Represents a collider shaped as a box.
 */
export class BoxCollider implements Collider<BoxCollider | SphereCollider> {
    private static points = [
        -1, 1,-1, 1, 1,-1,-1,-1,-1, 1,-1,-1,
        -1, 1, 1, 1, 1, 1,-1,-1, 1, 1,-1, 1
    ];
    public box = new Box();
    /**
     * Creates a new box collider.
     */
    constructor(public extents: Vector3, public transform = new Transform()) { }
    /**
     * Attaches the collider to a transform.
     */
    attach(transform: Transform) {
        this.transform = transform;
    }
    /**
     * Updates the box collider.
     */
    update() {
        this.transform.getPosition(this.box.center);
        this.extents.multiply(
            this.transform.getScaling(vector.next), this.box.extents);

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
    isColliding(collider: BoxCollider | SphereCollider, mtv?: Vector3) {
        if (collider instanceof BoxCollider) {
            return SAT.boxToBox(this.box, collider.box, mtv);
        }
        if (collider instanceof SphereCollider) {
            return SAT.boxToSphere(this.box, collider.sphere, mtv);
        }
    }
}

/**
 * The Separating Axis Theorem, SAT for short, is a method to determine if two 
 * convex shapes are intersecting.
 */
export namespace SAT {
    /**
     * Returns true if the spheres are intersecting.
     */
    export function sphereToSphere(a: Shape, b: Shape, mtv?: Vector3) {
        let axes: Vector3[] = [];

        // For two spheres there is only one axis test
        let axis = a.center.subtract(b.center, vector.next);
        axes.push(axis.normalize(axis));
        
        return Shape.isIntersecting(a, b, axes, mtv);
    }
    /**
     * Returns true if the boxes are intersecting.
     */
    export function boxToBox(a: Box, b: Box, mtv?: Vector3) {
        let axes: Vector3[] = [];
        
        // The first 6 axes (from the face normals) are used to check if there 
        // is a corner of one object intersecting a face of the other object.
        axes.push(...a.normals, ...b.normals);

        // The set of 9 axes formed by the cross products of edges are used to 
        // consider edge on edge collision detection, where there is not a 
        // vertex penetrating the other object.
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                let c = a.normals[i].cross(b.normals[j], vector.next);
                axes.push(c.normalize(c));
            }
        }
        return Shape.isIntersecting(a, b, axes, mtv);
    }
    /**
     * Returns true if the box is intersecting the sphere.
     */
    export function boxToSphere(a: Box, s: Shape, mtv?: Vector3) {
        let axes: Vector3[] = [];

        // When testing box with sphere using SAT, the only axis that needs to
        // be tested goes from center of sphere to closest point on box.
        let point = a.getClosestPoint(s.center, vector.next);
        point.add(a.center, point).subtract(s.center, point);
        axes.push(point.normalize(point));

        return Shape.isIntersecting(a, s, axes, mtv);
    }
    /**
     * Returns true if the sphere is intersecting the box.
     */
    export function sphereToBox(s: Shape, b: Box, mtv?: Vector3) {
        let axes: Vector3[] = [];

        // When testing box with sphere using SAT, the only axis that needs to
        // be tested goes from center of sphere to closest point on box.
        let point = b.getClosestPoint(s.center, vector.next);
        point.add(b.center, point).subtract(s.center, point);
        axes.push(point.normalize(point));

        return Shape.isIntersecting(s, b, axes, mtv);
    }
}

export class CollisionManager<T extends Collider<T>> {
    private colliders: T[] = [];
    /**
     * Creates a new collision manager.
     * @param onCollision Callback when a collsion occur.
     */
    constructor(public onCollision: (a: T, b: T, mtv: Vector3) => void) { }
    /**
     * Adds a collider.
     */
    addCollider(collider: T) {
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