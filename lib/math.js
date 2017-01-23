/*The MIT License (MIT)

Copyright (c) 2017 Jens Malmborg

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
const vec2 = require("./gl-matrix/vec2");
const vec3 = require("./gl-matrix/vec3");
const mat4 = require("./gl-matrix/mat4");
const quat = require("./gl-matrix/quat");
var Angle;
(function (Angle) {
    /**
     * Degrees-to-radians conversion constant.
     */
    Angle.deg2rad = (Math.PI * 2) / 360;
    /**
     * Radians-to-degrees conversion constant.
     */
    Angle.rad2deg = 360 / (Math.PI * 2);
})(Angle = exports.Angle || (exports.Angle = {}));
var Lerp;
(function (Lerp) {
    /**
     * Linearly interpolates between two values.
     */
    function number(a, b, t) {
        return a + t * (b - a);
    }
    Lerp.number = number;
})(Lerp = exports.Lerp || (exports.Lerp = {}));
/**
 * Representation of 2D vectors and points.
 */
class Vector2 extends Float32Array {
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
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    /**
     * Y component of the vector.
     */
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
    /**
     * Sets the x and y components.
     */
    xy(x, y) {
        this[0] = x;
        this[1] = y;
        return this;
    }
    /**
     * Returns a nicely formatted string for this vector.
     */
    toString() {
        return vec2.str(this);
    }
}
exports.Vector2 = Vector2;
/**
 * Representation of 3D vectors and points.
 */
class Vector3 extends Float32Array {
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
     * Returns the angle in degrees between a and b
     */
    static angle(a, b) {
        return vec3.angle(a, b) * Angle.rad2deg;
    }
    /**
     * Linearly interpolates between two vectors.
     */
    static lerp(a, b, t, out = new Vector3()) {
        return vec3.lerp(out, a, b, t);
    }
    /**
     * Returns the length of this vector.
     */
    get magnitude() {
        return vec3.length(this);
    }
    /**
     * Returns the squared length of this vector.
     */
    get sqrMagnitude() {
        return vec3.squaredLength(this);
    }
    /**
     * X component of the vector.
     */
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    /**
     * Y component of the vector.
     */
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
    /**
     * Z component of the vector.
     */
    get z() {
        return this[2];
    }
    set z(value) {
        this[2] = value;
    }
    /**
     * Adds two vectors.
     */
    add(v, out = new Vector3()) {
        return vec3.add(out, this, v);
    }
    /**
     * Copies the vector.
     */
    copy(out = new Vector3()) {
        return vec3.copy(out, this);
    }
    /**
     * Cross product of this and another vector.
     */
    cross(v, out = new Vector3()) {
        return vec3.cross(out, this, v);
    }
    /**
     * Dot product of this and another vector.
     */
    dot(v) {
        return vec3.dot(this, v);
    }
    /**
     * Returns true if the vectors are equal.
     */
    equals(v) {
        return vec3.equals(this, v);
    }
    /**
     *
     */
    negate(out = new Vector3()) {
        return vec3.negate(out, this);
    }
    /**
     *
     */
    normalize(out = new Vector3()) {
        return vec3.normalize(out, this);
    }
    /**
     * Multiplies two vectors.
     */
    multiply(v, out = new Vector3()) {
        return vec3.mul(out, this, v);
    }
    /**
     * Scales by a scalar number.
     */
    scale(n, out = new Vector3()) {
        return vec3.scale(out, this, n);
    }
    /**
     * Subtracts one vector from another.
     */
    subtract(v, out = new Vector3()) {
        return vec3.sub(out, this, v);
    }
    /**
     * Returns the squared distance between this and another vector.
     */
    sqrDistance(v) {
        return vec3.squaredDistance(this, v);
    }
    /**
     * Returns a nicely formatted string for this vector.
     */
    toString() {
        return vec3.str(this);
    }
    /**
     * Transforms this vector using a matrix or quaternion.
     */
    transform(t, out = new Vector3()) {
        if (t instanceof Matrix4) {
            return vec3.transformMat4(out, this, t);
        }
        if (t instanceof Quaternion) {
            return vec3.transformQuat(out, this, t);
        }
    }
    /**
     * Sets the x, y and z components.
     */
    xyz(x, y, z) {
        this[0] = x;
        this[1] = y;
        this[2] = z;
        return this;
    }
}
exports.Vector3 = Vector3;
/**
 * A standard 4x4 transformation matrix.
 */
class Matrix4 extends Float32Array {
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
        return mat4.str(this);
    }
    /**
     * Creates a matrix from a quaternion rotation, vector translation and
     * vector scale.
     */
    static createRotationTranslationScale(rotation, translation, scale, out = new Matrix4()) {
        return mat4.fromRotationTranslationScale(out, rotation, translation, scale);
    }
    /**
     * Multiplies this matrix with another.
     */
    multiply(m, out = new Matrix4()) {
        return mat4.multiply(out, this, m);
    }
    /**
     * Returns the transpose of this matrix.
     */
    transpose(out = new Matrix4()) {
        return mat4.transpose(out, this);
    }
    /**
     * Creates a identity matrix.
     */
    static createIdentity(result = new Matrix4()) {
        return mat4.identity(result);
    }
    /**
     * Creates a perspective projection matrix.
     */
    static createPerspective(fov, aspect, near, far, out = new Matrix4()) {
        return mat4.perspective(out, fov, aspect, near, far);
    }
    /**
     * Creates an orthogonal projection matrix.
     */
    static createOrtho(left, right, bottom, top, near, far, out = new Matrix4()) {
        return mat4.ortho(out, left, right, bottom, top, near, far);
    }
    /**
     * Creates a look-at view matrix.
     */
    static createLookAt(eye, center, up, out = new Matrix4()) {
        return mat4.lookAt(out, eye, center, up);
    }
}
exports.Matrix4 = Matrix4;
/**
 * Quaternions are used to represent rotations.
 */
class Quaternion extends Float32Array {
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
        return quat.copy(out, this);
    }
    /**
     * Multiplies two quaternions.
     */
    multiply(q, out = new Quaternion()) {
        return quat.mul(out, this, q);
    }
    /**
     * Rotates by the given angle about the X axis.
     */
    rotateX(angle) {
        quat.rotateX(this, this, angle);
    }
    /**
     * Rotates by the given angle about the Y axis.
     */
    rotateY(angle) {
        quat.rotateY(this, this, angle);
    }
    /**
     * Rotates by the given angle about the Z axis.
     */
    rotateZ(angle) {
        quat.rotateZ(this, this, angle);
    }
    /**
     * Returns a nicely formatted string for this quaternion.
     */
    toString() {
        return quat.str(this);
    }
    /**
     * Creates a new quaternion from a vector and an angle to rotate about the
     * vector.
     */
    static createFromAxisAngle(axis, angle, out = new Quaternion()) {
        return quat.setAxisAngle(out, axis, angle);
    }
    /**
     * Creates a identity quaternion.
     */
    static createIdentity(result = new Quaternion()) {
        return quat.identity(result);
    }
}
exports.Quaternion = Quaternion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1hdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUVYLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRXpDLElBQWlCLEtBQUssQ0FTckI7QUFURCxXQUFpQixLQUFLO0lBQ2xCOztPQUVHO0lBQ1UsYUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDMUM7O09BRUc7SUFDVSxhQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUM5QyxDQUFDLEVBVGdCLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQVNyQjtBQUVELElBQWlCLElBQUksQ0FPcEI7QUFQRCxXQUFpQixJQUFJO0lBQ2pCOztPQUVHO0lBQ0gsZ0JBQXVCLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNsRCxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRmUsV0FBTSxTQUVyQixDQUFBO0FBQ0wsQ0FBQyxFQVBnQixJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUFPcEI7QUFFRDs7R0FFRztBQUNILGFBQXFCLFNBQVEsWUFBWTtJQUNyQzs7T0FFRztJQUNILFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFD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