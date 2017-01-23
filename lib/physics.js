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
const math_1 = require("./math");
const transform_1 = require("./transform");
const utils_1 = require("./utils");
const vector = new utils_1.Pool(math_1.Vector3, 10);
class RigidBody {
    /**
     * Creates a new rigid body.
     */
    constructor(mass = 1, bounciness = 0.2, drag = 0) {
        this.mass = mass;
        this.bounciness = bounciness;
        this.drag = drag;
        this.transform = new transform_1.Transform();
        this.enableGravity = false;
        this.force = new math_1.Vector3();
        this.velocity = new math_1.Vector3();
    }
    /**
     * Returns the inverted mass of the rigid body.
     */
    get invertedMass() {
        return this.mass ? 1 / this.mass : 0;
    }
    /**
     * Adds an impulse to the rigid body.
     */
    addImpulse(impulse) {
        this.velocity.add(impulse, this.velocity);
    }
    /**
     * Adds a force to the rigid body.
     */
    addForce(force) {
        this.force.add(force, this.force);
    }
    /**
     * Attaches the rigid body to a transform.
     */
    attach(transform) {
        this.transform = transform;
    }
    /**
     * Updates the physics simulation.
     */
    update(elapsedTime) {
        if (this.enableGravity) {
            this.addForce(RigidBody.gravity.scale(this.mass, vector.next));
        }
        if (this.mass) {
            let force = this.force.scale(this.invertedMass * elapsedTime, vector.next);
            this.velocity.add(force, this.velocity);
            this.force.xyz(0, 0, 0);
        }
        if (this.drag) {
            let normalized = this.velocity.normalize(vector.next);
            let drag = normalized.scale(this.drag * elapsedTime, vector.next);
            if (drag.sqrMagnitude <= this.velocity.sqrMagnitude) {
                this.velocity.subtract(drag, this.velocity);
            }
            else {
                this.velocity.xyz(0, 0, 0);
            }
        }
        this.transform.move(this.velocity.scale(elapsedTime, vector.next));
    }
    /**
     *
     */
    static handleCollision(a, b, mtv) {
        if (!(a.invertedMass + b.invertedMass)) {
            return;
        }
        RigidBody.resolveCollision(a, b, mtv);
        RigidBody.calculateVelocity(a, b, mtv);
    }
    /**
     * Resolves collision with another rigid body.
     */
    static resolveCollision(a, b, mtv) {
        let invertedMassSum = a.invertedMass + b.invertedMass;
        a.transform.move(mtv.scale((a.invertedMass / invertedMassSum) * 1.01, vector.next));
        b.transform.move(mtv.scale(-(b.invertedMass / invertedMassSum) * 1.01, vector.next));
    }
    /**
     * Calculates the velocities after collision.
     */
    static calculateVelocity(a, b, mtv) {
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
RigidBody.gravity = new math_1.Vector3(0, -9.81, 0);
exports.RigidBody = RigidBody;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGh5c2ljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBoeXNpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUVYLGlDQUFnQztBQUNoQywyQ0FBdUM7QUFDdkMsbUNBQThCO0FBRTlCLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBSSxDQUFDLGNBQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVyQztJQU9JOztPQUVHO0lBQ0gsWUFBbUIsT0FBTyxDQUFDLEVBQVMsYUFBYSxHQUFHLEVBQVMsT0FBTyxDQUFDO1FBQWxELFNBQUksR0FBSixJQUFJLENBQUk7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFNO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBSTtRQVA5RCxjQUFTLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7UUFDNUIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsVUFBSyxHQUFHLElBQUksY0FBTyxFQUFFLENBQUM7UUFDdEIsYUFBUSxHQUFHLElBQUksY0FBTyxFQUFFLENBQUM7SUFJeUMsQ0FBQztJQUMxRTs7T0FFRztJQUNILElBQUksWUFBWTtRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxVQUFVLENBQUMsT0FBZ0I7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxRQUFRLENBQUMsS0FBYztRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFDRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxTQUFvQjtRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7O09BRUc7SUFDSCxNQUFNLENBQUMsV0FBbUI7UUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLENBQVksRUFBRSxDQUFZLEVBQUUsR0FBWTtRQUMzRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBWSxFQUFFLENBQVksRUFBRSxHQUFZO1FBQzVELElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUN0RCxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUN0QixDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FDdkIsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBWSxFQUFFLENBQVksRUFBRSxHQUFZO1FBQzdELElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWix1Q0FBdUM7WUFDdkMsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxlQUFlLENBQUM7UUFDOUIsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7O0FBbkdNLGlCQUFPLEdBQUcsSUFBSSxjQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRDlDLDhCQXFHQyJ9