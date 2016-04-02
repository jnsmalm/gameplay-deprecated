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

var Vector3 = require('./math.js').Vector3;
var Matrix = require('./math.js').Matrix;
var Color = require('./color.js').Color;
var Transform = require('./transform.js').Transform;
var Camera = require('./camera.js').Camera;

var _shaderProgram;
var _vertexSpec;
var _camera;
var _graphics;
var _texture;
var _vertices = [];
var _indices = [];
var _numberOfSprites = 0;
var _spriteVertices = [];

for (var i=0; i<4; i++) {
  _spriteVertices[i] = new Vector3();
}

class Sprite {
  constructor(texture) {
    if (!_graphics) {
      throw new TypeError('Sprite has not been initialized.');
    }
    if (typeof texture === 'string') {
      this.texture = new Texture2D(texture);
    } else {
      this.texture = texture;
    }
    this.align = {
      vertical: 'center',
      horizontal: 'center'
    };
    this.source = {
      x: 0,
      y: 0,
      w: this.texture ? this.texture.width : 0,
      h: this.texture ? this.texture.height : 0
    };
    this.color = Color.white();
    this.transform = new Transform();
    this.pixelsPerUnit = 100;
    this.animation = null;
  }

  get width() {
    return this.source.w / this.pixelsPerUnit;
  }

  get height() {
    return this.source.h / this.pixelsPerUnit;
  }

  update(elapsed) {
    if (!this.animation) {
      return;
    }
    this.animation.update(elapsed);
    this.source = this.animation.source;
    this.texture = this.animation.texture;
  }

  draw() {
    if (!this.texture) {
      return;
    }
    if (this.texture !== _texture) {
      Sprite.drawBatched();
    }
    // Instead of directly draw the sprite here, it's batched to improve
    // performance.
    _texture = this.texture;
    addSpriteVertexData(this);
  }

  static get camera() {
    return _camera;
  }

  static set camera(value) {
    _camera = value;
  }

  static init(window) {
    if (_graphics) {
      // Sprite has already been initialized.
      return;
    }
    _graphics = window.graphics;
    _shaderProgram = new ShaderProgram(
      _graphics, module.path + '/assets/shaders/sprite');

    _camera = new Camera({
      window: window,
      orthographic: true
    });

    _vertexSpec = new VertexSpecification(_graphics, ['vec3','vec2','vec4']);
  }

  static drawBatched() {
    if (_numberOfSprites === 0) {
      return;
    }
    _graphics.setBlendState('alphaBlend');
    _graphics.setDepthState('none');
    _graphics.setVertexSpecification(_vertexSpec);
    _graphics.setShaderProgram(_shaderProgram);
    _graphics.textures[0] = _texture;

    _vertexSpec.setVertexData(new Float32Array(_vertices), 'stream');
    _vertexSpec.setIndexData(new Int32Array(_indices), 'stream');

    _shaderProgram.viewProjection = _camera.viewProjection;

    // Draw the batched sprites in a single draw call.
    _graphics.drawIndexedPrimitives({
      primitiveType: 'triangleList',
      vertexStart: 0,
      primitiveCount: _numberOfSprites * 2
    });

    _vertices = [];
    _indices = [];
    _numberOfSprites = 0;
  }
}

class SpriteSheet {
  constructor(options) {
    if (typeof options.texture === 'string') {
      this.texture = new Texture2D(options.texture);
    } else {
      this.texture = options.texture;
    }
    this.width = options.width;
    this.height = options.height;
  }

  getFrameSource(frame) {
    return {
      x: frame * this.width % this.texture.width,
      y: Math.floor(frame/(this.texture.width/this.width)) * this.height,
      w: this.width,
      h: this.height
    };
  }
}

class SpriteAnimation {
  constructor(options) {
    this.frame = 0;
    this.elapsed = 0;
    this.sheet = options.sheet;
    this.start = options.start || 0;
    this.length = options.length || 0;
    this.fps = options.fps || 10;
    this.loop = options.loop;
    this.source = { 
      x: 0, 
      y: 0, 
      w: this.sheet.width, 
      h: this.sheet.height 
    };
  }

  get texture() {
    return this.sheet.texture;
  }

  update(elapsed) {
    if (!this.loop && this.frame === this.start + this.length - 1) {
      // This animation doesn't loop and we have reached the last frame.
      return;
    }
    if ((this.elapsed += elapsed) > 1 / this.fps) {
      this.frame = (this.frame + 1) % this.length + this.start;
      this.elapsed -= 1 / this.fps;
    }
    this.source = this.sheet.getFrameSource(this.frame);
  }
}

function addSpriteVertexData(sprite) {
  var d = getSpriteVertexData(sprite);
  var c = sprite.color;
  var i = _numberOfSprites * 4;

  // Push the vertex data and indicies in a single call to improve performance.
  _indices.push(i, i+3, i+2, i, i+1, i+3);
  _vertices.push(
    d[0].p[0], d[0].p[1], d[0].p[2], d[0].u, d[0].v, c[0], c[1], c[2], c[3],
    d[1].p[0], d[1].p[1], d[1].p[2], d[1].u, d[1].v, c[0], c[1], c[2], c[3],
    d[2].p[0], d[2].p[1], d[2].p[2], d[2].u, d[2].v, c[0], c[1], c[2], c[3],
    d[3].p[0], d[3].p[1], d[3].p[2], d[3].u, d[3].v, c[0], c[1], c[2], c[3]
  );
  
  _numberOfSprites++;
}

var getSpriteVertexData = function(sprite) {
  var r = getSpriteRectangle(sprite);
  var t = getTextureCoordinates(sprite);

  // Using the sprite's transform (position, rotation and scale) each vertex 
  // position is being calculated.
  _spriteVertices[0].set(r.x,     r.y,     0);
  _spriteVertices[1].set(r.x+r.w, r.y,     0);
  _spriteVertices[2].set(r.x,     r.y-r.h, 0);
  _spriteVertices[3].set(r.x+r.w, r.y-r.h, 0);
  for (var i=0; i<4; i++) {
    _spriteVertices[i].transform(sprite.transform.world, _spriteVertices[i]);
  }

  return [
    { p: _spriteVertices[0], u: t.u1, v: t.v1 },
    { p: _spriteVertices[1], u: t.u2, v: t.v1 },
    { p: _spriteVertices[2], u: t.u1, v: t.v2 },
    { p: _spriteVertices[3], u: t.u2, v: t.v2 }
  ];
};

function getSpriteRectangle(sprite) {
  var x = 0;
  var y = 0;
  switch (sprite.align.horizontal) {
    case 'left':
      break;
    case 'center':
      x = sprite.width / -2;
      break;
    case 'right':
      x = sprite.width;
      break;
    default:
      throw new TypeError('Unknown horizontal align \'' + 
        sprite.align.horizontal + '\' for sprite.');
  }
  switch (sprite.align.vertical) {
    case 'top':
      break;
    case 'center':
      y = sprite.height / 2;
      break;
    case 'bottom':
      y = sprite.height;
      break;
    default:
      throw new TypeError('Unknown vertical align \'' + 
        sprite.align.vertical + '\' for sprite.');
  }
  return {
    x: x,
    y: y,
    w: sprite.width,
    h: sprite.height
  };
}

function getTextureCoordinates(sprite) {
  var source = sprite.source;
  var width = sprite.texture.width;
  var height = sprite.texture.height;
  return {
    u1: source.x / width,
    u2: source.w / width + source.x / width,
    v1: source.y / height,
    v2: source.h / height + source.y / height
  };
}

module.exports.Sprite = Sprite;
module.exports.SpriteAnimation = SpriteAnimation;
module.exports.SpriteSheet = SpriteSheet;