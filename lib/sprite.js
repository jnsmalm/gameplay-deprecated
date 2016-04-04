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
var Color = require('./color.js').Color;
var Transform = require('./transform.js').Transform;
var Camera = require('./camera.js').Camera;

class SpriteBatch {
  constructor(window) {
    this.spriteVertexData = new SpriteVertexData();
    this.graphics = window.graphics;
    this.shaderProgram = new ShaderProgram(
      this.graphics, module.path + '/assets/shaders/sprite');

    this.camera = new Camera({
      window: window,
      orthographic: true
    });

    this.vertexSpec = new VertexSpecification(
      this.graphics, ['vec3','vec2','vec4']);

    this.sprites = [];
    this.vertices = [];
    this.indices = [];

    this.numberOfSpritesInBatch = 0;
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
  }

  drawBatch(texture) {
    var vertices = new Float32Array(this.vertices);
    var indices = new Int32Array(this.indices);

    this.graphics.textures[0] = texture;
    this.vertexSpec.setVertexData(vertices, 'stream');
    this.vertexSpec.setIndexData(indices, 'stream');

    this.graphics.drawIndexedPrimitives({
      primitiveType: 'triangleList',
      vertexStart: 0,
      // Each sprite is drawn as two triangles.
      primitiveCount: this.numberOfSpritesInBatch * 2
    });

    this.vertices = [];
    this.indices = [];
    this.numberOfSpritesInBatch = 0;
  }

  drawSprites(options = {}) {
    var { 
      sortMode = 'none', 
      blendState = 'alphaBlend', 
      depthState = 'none' 
    } = options;

    if (this.sprites.length === 0) {
      return;
    }

    SpriteSort.sortSprites(this.sprites, sortMode);

    var savedState = {
      blendState: this.graphics.blendState,
      depthState: this.graphics.depthState
    };

    this.graphics.blendState = blendState;
    this.graphics.depthState = depthState;

    this.graphics.setVertexSpecification(this.vertexSpec);
    this.graphics.setShaderProgram(this.shaderProgram);
    this.shaderProgram.viewProjection = this.camera.viewProjection;

    var texture = this.sprites[0].texture;
    for (var i=0; i<this.sprites.length; i++) {
      if (this.sprites[i].texture !== texture) {
        this.drawBatch(texture);
        texture = this.sprites[i].texture;
      }
      this.addSpriteToBatch(this.sprites[i]);
    }
    this.drawBatch(texture);
    this.sprites = [];

    this.graphics.blendState = savedState.blendState;
    this.graphics.depthState = savedState.depthState;
  }

  addSpriteToBatch(sprite) {
    var d = this.spriteVertexData.getSpriteVertexData(sprite);
    var c = sprite.color;
    var i = this.numberOfSpritesInBatch * 4;

    this.indices.push(i, i+3, i+2, i, i+1, i+3);
    this.vertices.push(
      d[0].p[0], d[0].p[1], d[0].p[2], d[0].u, d[0].v, c[0], c[1], c[2], c[3],
      d[1].p[0], d[1].p[1], d[1].p[2], d[1].u, d[1].v, c[0], c[1], c[2], c[3],
      d[2].p[0], d[2].p[1], d[2].p[2], d[2].u, d[2].v, c[0], c[1], c[2], c[3],
      d[3].p[0], d[3].p[1], d[3].p[2], d[3].u, d[3].v, c[0], c[1], c[2], c[3]
    );
    
    this.numberOfSpritesInBatch++;
  }
}

class SpriteVertexData {
  constructor() {
    this.vertices = [];
    for (var i=0; i<4; i++) {
      this.vertices[i] = new Vector3();
    }
  }

  getSpriteVertexData(sprite) {
    var r = this.getSpriteRectangle(sprite);
    var t = this.getTextureCoordinates(sprite);

    // Using the sprite's transform (position, rotation and scale) each vertex 
    // position is being calculated.
    this.vertices[0].set(r.x,     r.y,     0);
    this.vertices[1].set(r.x+r.w, r.y,     0);
    this.vertices[2].set(r.x,     r.y-r.h, 0);
    this.vertices[3].set(r.x+r.w, r.y-r.h, 0);
    for (var i=0; i<4; i++) {
      this.vertices[i].transform(sprite.transform.world, this.vertices[i]);
    }

    return [
      { p: this.vertices[0], u: t.u1, v: t.v1 },
      { p: this.vertices[1], u: t.u2, v: t.v1 },
      { p: this.vertices[2], u: t.u1, v: t.v2 },
      { p: this.vertices[3], u: t.u2, v: t.v2 }
    ];
  }

  getSpriteRectangle(sprite) {
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

  getTextureCoordinates(sprite) {
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
}

class SpriteSort {
  static sortSprites(sprites, sortMode) {
    switch (sortMode) {
      case 'none': {
        return;
      }
      case 'frontToBack': {
        sprites.sort(SpriteSort.sortFrontToBack);
        return;
      }
      case 'backToFront': {
        sprites.sort(SpriteSort.sortBackToFront);
        return;
      }
      case 'texture': {
        sprites.sort(SpriteSort.sortByTexture);
        return;
      }
      default: {
        throw new TypeError(`Unknown sprite sort mode '${sortMode}'`);
      }
    }
  }

  static sortByTexture(a, b) {
    if (a.texture !== b.texture) {
      return 1;
    }
    return 0;
  }

  static sortFrontToBack(a, b) {
    if (a.transform[14] > b.transform[14]) {
      return -1;
    }
    if (a.transform[14] < b.transform[14]) {
      return 1;
    }
    return 0;
  }

  static sortBackToFront(a, b) {
    if (a.transform[14] < b.transform[14]) {
      return -1;
    }
    if (a.transform[14] > b.transform[14]) {
      return 1;
    }
    return 0;
  }
}

class Sprite {
  constructor(spriteBatch, texture) {
    if (!(spriteBatch instanceof SpriteBatch)) {
      throw new TypeError('Argument 1: Expected type SpriteBatch.');
    }
    this.spriteBatch = spriteBatch;
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
    this.spriteBatch.addSprite(this);
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
    var isLastFrame = this.frame === this.start + this.length - 1;
    if (!this.loop && isLastFrame) {
      return;
    }
    if ((this.elapsed += elapsed) > 1 / this.fps) {
      this.frame = (this.frame + 1) % this.length + this.start;
      this.elapsed -= 1 / this.fps;
    }
    this.source = this.sheet.getFrameSource(this.frame);
  }
}

module.exports.SpriteBatch = SpriteBatch;
module.exports.Sprite = Sprite;
module.exports.SpriteAnimation = SpriteAnimation;
module.exports.SpriteSheet = SpriteSheet;