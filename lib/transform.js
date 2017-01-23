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
const utils_1 = require("./utils");
const vector = new utils_1.Pool(math_1.Vector3, 5);
const matrix = new utils_1.Pool(math_1.Matrix4, 5);
class Transform {
    /**
     * Creates a new transformation.
     */
    constructor(initial, parent) {
        this.initial = initial;
        this.parent = parent;
        this.localRotation = math_1.Quaternion.createIdentity();
        this.localPosition = new math_1.Vector3();
        this.localScale = new math_1.Vector3(1, 1, 1);
    }
    /**
     * Moves by given vector relative to the current position.
     */
    move(vector) {
        this.localPosition.add(vector, this.localPosition);
    }
    /**
     * Rotates by the given angle about the X axis.
     */
    rotateX(angle) {
        this.localRotation.rotateX(angle);
    }
    /**
     * Rotates by the given angle about the Y axis.
     */
    rotateY(angle) {
        this.localRotation.rotateY(angle);
    }
    /**
     * Rotates by the given angle about the Z axis.
     */
    rotateZ(angle) {
        this.localRotation.rotateZ(angle);
    }
    /**
     * Scales by given vector.
     */
    scale(vector) {
        this.localScale.multiply(vector, this.localScale);
    }
    /**
     * Returns the position in world-space.
     */
    getPosition(out = new math_1.Vector3()) {
        if (this.parent) {
            let parentPosition = this.parent.getPosition(out);
            return parentPosition.add(this.localPosition, out);
        }
        else {
            return this.localPosition.copy(out);
        }
    }
    /**
     * Sets the position in world-space.
     */
    setPosition(position) {
        if (this.parent) {
            let parentPosition = this.parent.getPosition(vector.next);
            position.subtract(parentPosition, this.localPosition);
        }
        else {
            position.copy(this.localPosition);
        }
    }
    /**
     * Returns the scaling in world-space.
     */
    getScaling(out = new math_1.Vector3()) {
        if (!this.parent) {
            return this.localScale.copy(out);
        }
        let parentScaling = this.parent.getScaling(out);
        return parentScaling.multiply(this.localScale, out);
    }
    /**
     * Returns the rotation in world-space.
     */
    getRotation(out = new math_1.Quaternion()) {
        if (!this.parent) {
            return this.localRotation.copy(out);
        }
        let parentRotation = this.parent.getRotation(out);
        return parentRotation.multiply(this.localRotation, out);
    }
    /**
     * Returns the transformation matrix in local-space.
     */
    getLocalMatrix(out = new math_1.Matrix4()) {
        let local = math_1.Matrix4.createRotationTranslationScale(this.localRotation, this.localPosition, this.localScale, out);
        if (this.initial) {
            return this.initial.multiply(local, out);
        }
        return local;
    }
    /**
     * Returns the transformation matrix in world-space.
     */
    getWorldMatrix(out = new math_1.Matrix4()) {
        let local = this.getLocalMatrix(out);
        if (!this.parent) {
            return local;
        }
        let parent = this.parent.getWorldMatrix(matrix.next);
        return parent.multiply(local, out);
    }
}
exports.Transform = Transform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFFWCxpQ0FBc0Q7QUFDdEQsbUNBQStCO0FBRS9CLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBSSxDQUFDLGNBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQUksQ0FBQyxjQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFcEM7SUFJSTs7T0FFRztJQUNILFlBQW1CLE9BQWlCLEVBQVMsTUFBa0I7UUFBNUMsWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQVk7UUFOeEQsa0JBQWEsR0FBRyxpQkFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzVDLGtCQUFhLEdBQUcsSUFBSSxjQUFPLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSxjQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUkwQixDQUFDO0lBQ3BFOztPQUVHO0lBQ0gsSUFBSSxDQUFDLE1BQWU7UUFDaEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxPQUFPLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxPQUFPLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxPQUFPLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxL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