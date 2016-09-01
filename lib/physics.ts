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

import { Vector3 } from "./math"
import { Transform } from "./transform"
import { Pool } from "./utils"

const vector = new Pool(Vector3, 10);

export class RigidBody {
    static gravity = new Vector3(0, -9.81, 0);

    public transform = new Transform();
    public enableGravity = false;
    public force = new Vector3();
    public velocity = new Vector3();
    /**
     * Creates a new rigid body.
     */
    constructor(public mass = 1, public bounciness = 0.2, public drag = 0) { }
    /**
     * Returns the inverted mass of the rigid body.
     */
    get invertedMass() {
        return this.mass ? 1 / this.mass : 0;
    }
    /**
     * Adds an impulse to the rigid body.
     */
    addImpulse(impulse: Vector3) {
        this.velocity.add(impulse, this.velocity);
    }
    /**
     * Adds a force to the rigid body.
     */
    addForce(force: Vector3) {
        this.force.add(force, this.force);
    }
    /**
     * Attaches the rigid body to a transform.
     */
    attach(transform: Transform) {
        this.transform = transform;
    }
    /**
     * Updates the physics simulation.
     */
    update(elapsedTime: number) {
        if (this.enableGravity) {
            this.addForce(RigidBody.gravity.scale(this.mass, vector.next));
        }
        if (this.mass) {
            let force = this.force.scale(
                this.invertedMass * elapsedTime, vector.next);
            this.velocity.add(force, this.velocity);
            this.force.xyz(0, 0, 0);
        }
        if (this.drag) {
            let normalized = this.velocity.normalize(vector.next);
            let drag = normalized.scale(this.drag * elapsedTime, vector.next);
            if (drag.sqrMagnitude <= this.velocity.sqrMagnitude) {
                this.velocity.subtract(drag, this.velocity);
            } else {
                this.velocity.xyz(0, 0, 0);
            }
        }
        this.transform.move(
            this.velocity.scale(elapsedTime, vector.next));
    }
    /**
     * 
     */
    static handleCollision(a: RigidBody, b: RigidBody, mtv: Vector3) {
        if (!(a.invertedMass + b.invertedMass)) {
            return;
        }
        RigidBody.resolveCollision(a, b, mtv);
        RigidBody.calculateVelocity(a, b, mtv);
    }
    /**
     * Resolves collision with another rigid body.
     */
    static resolveCollision(a: RigidBody, b: RigidBody, mtv: Vector3) {
        let invertedMassSum = a.invertedMass + b.invertedMass;
        a.transform.move(mtv.scale(
            (a.invertedMass / invertedMassSum) * 1.01, vector.next));
        b.transform.move(mtv.scale(-
            (b.invertedMass / invertedMassSum) * 1.01, vector.next));
    }
    /**
     * Calculates the velocities after collision.
     */
    static calculateVelocity(a: RigidBody, b: RigidBody, mtv: Vector3) {
        let mtvn = mtv.normalize(vector.next);
        let relative = a.velocity.subtract(b.velocity, vector.next);
        let angle = relative.dot(mtvn);
        if (angle > 0) {
            // Already moving away from each other.
            return;
        }
        let bounciness = Math.min(a.bounciness, b.bounciness);
        let scalar = -(1 + bounciness) * angle;
        let invertedMassSum = a.invertedMass + b.invertedMass;
        if (invertedMassSum > 0) {
            scalar /= invertedMassSum;
        }
        let impulse = mtvn.scale(scalar, vector.next);
        a.addImpulse(impulse.scale(a.invertedMass, vector.next));
        b.addImpulse(impulse.scale(-b.invertedMass, vector.next));
    }
}