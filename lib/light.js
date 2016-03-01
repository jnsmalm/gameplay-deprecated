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

'use strict';

var Transform = require('./transform.js').Transform;
var Color = require('./color.js').Color;
var Vector3 = require('./math.js').Vector3;

class Light {
  constructor(position) {
    this.transform = new Transform();
    if (position) {
      this.transform.position = position;
    }
    this.color = Color.white();
    this.attenuation = 0.1;
    this.ambientCoefficient = 0.1;
  }
}

class DirectionalLight extends Light {
  constructor(position) {
    super(position);
  }
}

class PointLight extends Light {
  constructor(position) {
    super(position);
  }
}

class SpotLight extends Light {
  constructor(position) {
    super(position);
    this.coneAngle = 15.1;
    this.coneDirection = new Vector3(0,0,-1);
  }
}

module.exports.PointLight = PointLight;
module.exports.DirectionalLight = DirectionalLight;
module.exports.SpotLight = SpotLight;