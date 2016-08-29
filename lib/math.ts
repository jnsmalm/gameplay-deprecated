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

const vec2 = require("./gl-matrix/vec2");
const vec3 = require("./gl-matrix/vec3");
const mat4 = require("./gl-matrix/mat4");
const quat = require("./gl-matrix/quat");

/**
 * Representation of 2D vectors and points.
 */
export class Vector2 extends Float32Array {
    /**
     * Creates a new vector with given x, y components.
     */
    constructor(x = 0, y = 0) {
        super(2);
        this[0] = x;
        this[1] = y;
    }
    /**
     * X component of the vector.
     */
    get x(): number {
        return this[0];
    }
    set x(value: number) {
        this[0] = value;
    }
    /**
     * Y component of the vector.
     */
    get y(): number {
        return this[1];
    }
    set y(value: number) {
        this[1] = value;
    }
    /**
     * Sets the x and y components.
     */
    xy(x: number, y: number) {
        this[0] = x;
        this[1] = y;
        return this;
    }
    /**
     * Returns a nicely formatted string for this vector.
     */
    toString() {
        return <string>vec2.str(this);
    }
}

/**
 * Representation of 3D vectors and points.
 */
export class Vector3 extends Float32Array {
    /**
     * Creates a new vector with given x, y, z components.
     */
    constructor(x = 0, y = 0, z = 0) {
        super(3);
        this[0] = x;
        this[1] = y;
        this[2] = z;
    }
    /**
     * Returns the length of this vector.
     */
    get magnitude() {
        return <number>vec3.length(this);
    }
    /**
     * Returns the squared length of this vector.
     */
    get sqrMagnitude() {
        return <number>vec3.squaredLength(this);
    }
    /**
     * X component of the vector.
     */
    get x() {
        return this[0];
    }
    set x(value: number) {
        this[0] = value;
    }
    /**
     * Y component of the vector.
     */
    get y() {
        return this[1];
    }
    set y(value: number) {
        this[1] = value;
    }
    /**
     * Z component of the vector.
     */
    get z() {
        return this[2];
    }
    set z(value: number) {
        this[2] = value;
    }
    /**
     * Adds two vectors.
     */
    add(v: Vector3, out = new Vector3()) {
        return <Vector3>vec3.add(out, this, v);
    }
    /**
     * Copies the vector.
     */
    copy(out = new Vector3()) {
        return <Vector3>vec3.copy(out, this);
    }
    /**
     * Cross product of this and another vector.
     */
    cross(v: Vector3, out = new Vector3()) {
        return <Vector3>vec3.cross(out, this, v);
    }
    /**
     * Dot product of this and another vector.
     */
    dot(v: Vector3) {
        return <number>vec3.dot(this, v);
    }
    /**
     * Returns true if the vectors are equal.
     */
    equals(v: Vector3) {
        return <boolean>vec3.equals(this, v);
    }
    /**
     * 
     */
    negate(out = new Vector3()) {
        return <Vector3>vec3.negate(out, this);
    }
    /**
     * 
     */
    normalize(out = new Vector3()) {
        return <Vector3>vec3.normalize(out, this);
    }
    /**
     * Multiplies two vectors.
     */
    multiply(v: Vector3, out = new Vector3()) {
        return <Vector3>vec3.mul(out, this, v);
    }
    /**
     * Scales by a scalar number.
     */
    scale(n: number, out = new Vector3()) {
        return <Vector3>vec3.scale(out, this, n);
    }
    /**
     * Subtracts one vector from another.
     */
    subtract(v: Vector3, out = new Vector3()) {
        return <Vector3>vec3.sub(out, this, v);
    }
    /**
     * Returns the squared distance between this and another vector.
     */
    sqrDistance(v: Vector3) {
        return <number>vec3.squaredDistance(this, v);
    }
    /**
     * Returns a nicely formatted string for this vector.
     */
    toString() {
        return <string>vec3.str(this);
    }
    /**
     * Transforms this vector using a matrix or quaternion.
     */
    transform(t: Matrix4 | Quaternion, out = new Vector3()) {
        if (t instanceof Matrix4) {
            return <Vector3>vec3.transformMat4(out, this, t);
        }
        if (t instanceof Quaternion) {
            return <Vector3>vec3.transformQuat(out, this, t);
        }
    }
    /**
     * Sets the x, y and z components.
     */
    xyz(x: number, y: number, z: number) {
        this[0] = x;
        this[1] = y;
        this[2] = z;
        return this;
    }
}

/**
 * A standard 4x4 transformation matrix.
 */
export class Matrix4 extends Float32Array {
    /**
     * Creates a new matrix.
     */
    constructor() {
        super(16);
    }
    /** 
     * Returns the forward vector.
     */
    getForward(out = new Vector3()) {
        out[0] = this[8];
        out[1] = this[9];
        out[2] = this[10];
        return out;
    }
    /** 
     * Returns the up vector.
     */
    getUp(out = new Vector3()) {
        out[0] = this[4];
        out[1] = this[5];
        out[2] = this[6];
        return out;
    }
    /**
     * Returns the right vector.
     */
    getRight(out = new Vector3()) {
        out[0] = this[0];
        out[1] = this[1];
        out[2] = this[2];
        return out;
    }
    /**
     * Returns a nicely formatted string for this matrix.
     */
    toString() {
        return <string>mat4.str(this);
    }
    /**
     * Creates a matrix from a quaternion rotation, vector translation and 
     * vector scale.
     */
    static createRotationTranslationScale(rotation: Quaternion,
        translation: Vector3, scale: Vector3, out = new Matrix4()) {

        return <Matrix4>mat4.fromRotationTranslationScale(
            out, rotation, translation, scale);
    }
    /**
     * Multiplies this matrix with another.
     */
    multiply(m: Matrix4, out = new Matrix4()) {
        return <Matrix4>mat4.multiply(out, this, m);
    }
    /**
     * Returns the transpose of this matrix.
     */
    transpose(out = new Matrix4()) {
        return <Matrix4>mat4.transpose(out, this);
    }
    /**
     * Creates a identity matrix.
     */
    static createIdentity(result = new Matrix4()) {
        return <Matrix4>mat4.identity(result);
    }
    /**
     * Creates a perspective projection matrix.
     */
    static createPerspective(fov: number, aspect: number, near: number, 
        far: number, out = new Matrix4()) {

        return <Matrix4>mat4.perspective(out, fov, aspect, near, far);
    }
    /**
     * Creates an orthogonal projection matrix.
     */
    static createOrtho(left: number, right: number, bottom: number, top: number,
        near: number, far: number, out = new Matrix4()) {

        return <Matrix4>mat4.ortho(out, left, right, bottom, top, near, far);
    }
    /**
     * Creates a look-at view matrix.
     */
    static createLookAt(
        eye: Vector3, center: Vector3, up: Vector3, out = new Matrix4()) {

        return <Matrix4>mat4.lookAt(out, eye, center, up);
    }
}

/**
 * Quaternions are used to represent rotations.
 */
export class Quaternion extends Float32Array {
    /**
     * Creates a new quaternion.
     */
    constructor() {
        super(4);
    }
    /**
     * Copies the quaternion.
     */
    copy(out = new Quaternion()) {
        return <Quaternion>quat.copy(out, this);
    }
    /**
     * Multiplies two quaternions.
     */
    multiply(q: Quaternion, out = new Quaternion()) {
        return <Quaternion>quat.mul(out, this, q);
    }
    /**
     * Rotates by the given angle about the X axis.
     */
    rotateX(angle: number) {
        quat.rotateX(this, this, angle);
    }
    /**
     * Rotates by the given angle about the Y axis.
     */
    rotateY(angle: number) {
        quat.rotateY(this, this, angle);
    }
    /**
     * Rotates by the given angle about the Z axis.
     */
    rotateZ(angle: number) {
        quat.rotateZ(this, this, angle);
    }
    /**
     * Returns a nicely formatted string for this quaternion.
     */
    toString() {
        return <string>quat.str(this);
    }
    /**
     * Creates a new quaternion from a vector and an angle to rotate about the 
     * vector.
     */
    static createFromAxisAngle(
        axis: Vector3, angle: number, out = new Quaternion()) {

        return <Quaternion>quat.setAxisAngle(out, axis, angle);
    }
    /**
     * Creates a identity quaternion.
     */
    static createIdentity(result = new Quaternion()) {
        return <Quaternion>quat.identity(result);
    }
}