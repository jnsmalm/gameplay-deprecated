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

function Color(r, g, b, a) {
    this[0] = r || 0;
    this[1] = g || 0;
    this[2] = b || 0;
    this[3] = a || 0;

    Object.defineProperty(this, 'r', {
        get: function() {
            return this[0];
        },
        set: function(value) {
            this[0] = value;
        }
    });

    Object.defineProperty(this, 'g', {
        get: function() {
            return this[1];
        },
        set: function(value) {
            this[1] = value;
        }
    });

    Object.defineProperty(this, 'b', {
        get: function() {
            return this[2];
        },
        set: function(value) {
            this[2] = value;
        }
    });

    Object.defineProperty(this, 'a', {
        get: function() {
            return this[3];
        },
        set: function(value) {
            this[3] = value;
        }
    });
}

Color.prototype = new Float32Array(4);

Color.fromRGBA = function (r, g, b, a) {
    return new Color(r / 255, g / 255, b / 255, a / 255);
};

Color.white = function () {
    return Color.fromRGBA(255, 255, 255, 255);
};

Color.black = function () {
    return Color.fromRGBA(0, 0, 0, 255);
};

Color.red = function () {
    return Color.fromRGBA(255, 0, 0, 255);
};

Color.green = function () {
    return Color.fromRGBA(0, 255, 0, 255);
};

Color.blue = function () {
    return Color.fromRGBA(0, 0, 255, 255);
};

Color.cornflowerBlue = function () {
    return Color.fromRGBA(100, 149, 237, 255);
};

module.exports.Color = Color;