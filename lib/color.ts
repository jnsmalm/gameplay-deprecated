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

/**
 * Representation of RGBA colors. Each color component is a floating point value 
 * with a range from 0 to 1.
 */
export class Color extends Float32Array {
    /**
     * Creates a new color with given r, g, b, a components.
     */
    constructor(r = 0, g = 0, b = 0, a = 0) {
        super(4);
        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }
    /**
     * Red component of the color.
     */
    get r() {
        return this[0];
    }
    set r(value: number) {
        this[0] = value;
    }
    /**
     * Green component of the color.
     */
    get g() {
        return this[1];
    }
    set g(value: number) {
        this[1] = value;
    }
    /**
     * Blue component of the color.
     */
    get b() {
        return this[2];
    }
    set b(value: number) {
        this[2] = value;
    }
    /**
     * Alpha component of the color.
     */
    get a() {
        return this[3];
    }
    set a(value: number) {
        this[3] = value;
    }
    /**
     * Solid black. RGBA is (0, 0, 0, 1).
     */
    static get black() {
        return new Color(0, 0, 0, 1);
    }
    /**
     * Solid blue. RGBA is (0, 0, 1, 1).
     */
    static get blue() {
        return new Color(0, 0, 1, 1);
    }
    /**
     * Completely transparent. RGBA is (0, 0, 0, 0).
     */
    static get clear() {
        return new Color(0, 0, 0, 0 );
    }
    /**
     * Cyan. RGBA is (0, 1, 1, 1).
     */
    static get cyan() {
        return new Color(0, 1, 1, 1);
    }
    /**
     * Gray. RGBA is (0.5, 0.5, 0.5, 1).
     */
    static get gray() {
        return new Color(0.5, 0.5, 0.5, 1);
    }
    /**
     * Solid green. RGBA is (0, 1, 0, 1).
     */
    static get green() {
        return new Color(0, 1, 0, 1);
    }
    /**
     * Magenta. RGBA is (1, 0, 1, 1).
     */
    static get magenta() {
        return new Color(1, 0, 1, 1);
    }
    /**
     * Solid red. RGBA is (1, 0, 0, 1).
     */
    static get red() {
        return new Color(1, 0, 0, 1);
    }
    /** 
     * Solid white. RGBA is (1, 1, 1, 1).
     */
    static get white() {
        return new Color(1, 1, 1, 1);
    }
}