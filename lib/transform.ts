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

import { Vector3, Matrix4, Quaternion } from "./math";
import { Pool } from "./utils";

const vector = new Pool(Vector3, 5);
const matrix = new Pool(Matrix4, 5);

export class Transform {
    public localRotation = Quaternion.createIdentity();
    public localPosition = new Vector3();
    public localScale = new Vector3(1, 1, 1);
    /** 
     * Creates a new transformation.
     */
    constructor(public initial?: Matrix4, public parent?: Transform) { }
    /**
     * Moves by given vector relative to the current position.
     */
    move(vector: Vector3) {
        this.localPosition.add(vector, this.localPosition);
    }
    /**
     * Rotates by the given angle about the X axis.
     */
    rotateX(angle: number) {
        this.localRotation.rotateX(angle);
    }
    /**
     * Rotates by the given angle about the Y axis.
     */
    rotateY(angle: number) {
        this.localRotation.rotateY(angle);
    }
    /**
     * Rotates by the given angle about the Z axis.
     */
    rotateZ(angle: number) {
        this.localRotation.rotateZ(angle);
    }
    /**
     * Scales by given vector.
     */
    scale(vector: Vector3) {
        this.localScale.multiply(vector, this.localScale);
    }
    /** 
     * Returns the position in world-space.
     */
    getPosition(out = new Vector3()): Vector3 {
        if (this.parent) {
            let parentPosition = this.parent.getPosition(out);
            return parentPosition.add(this.localPosition, out);
        } else {
            return this.localPosition.copy(out);
        }
    }
    /**
     * Sets the position in world-space.
     */
    setPosition(position: Vector3) {
        if (this.parent) {
            let parentPosition = this.parent.getPosition(vector.next);
            position.subtract(parentPosition, this.localPosition);
        } else {
            position.copy(this.localPosition);
        }
    }
    /** 
     * Returns the scaling in world-space.
     */
    getScaling(out = new Vector3()): Vector3 {
        if (!this.parent) {
            return this.localScale.copy(out);
        }
        let parentScaling = this.parent.getScaling(out);
        return parentScaling.multiply(this.localScale, out);
    }
    /** 
     * Returns the rotation in world-space.
     */
    getRotation(out = new Quaternion()): Quaternion {
        if (!this.parent) {
            return this.localRotation.copy(out);
        }
        let parentRotation = this.parent.getRotation(out);
        return parentRotation.multiply(this.localRotation, out);
    }
    /** 
     * Returns the transformation matrix in local-space.
     */
    getLocalMatrix(out = new Matrix4()) {
        let local = Matrix4.createRotationTranslationScale(
            this.localRotation, this.localPosition, this.localScale, out);
        if (this.initial) {
            return this.initial.multiply(local, out);
        }
        return local;
    }
    /** 
     * Returns the transformation matrix in world-space.
     */
    getWorldMatrix(out = new Matrix4()): Matrix4 {
        let local = this.getLocalMatrix(out);
        if (!this.parent) {
            return local;
        }
        let parent = this.parent.getWorldMatrix(matrix.next);
        return parent.multiply(local, out);
    }
}