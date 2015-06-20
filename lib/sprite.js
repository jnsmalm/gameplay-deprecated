var Color = require("color.js").Color;
var Component = require("component.js").Component;
var Vector = require("math.js").Vector;
var mat4 = require("matrix.js").mat4;

function SpriteBatch (window) {
    this.graphics = window.graphics;
    var vertexDeclaration = [
        { attributeName: 'position', attributeType: 'vec2' },
        { attributeName: 'rotation', attributeType: 'float' },
        { attributeName: 'source', attributeType: 'vec4' },
        { attributeName: 'size', attributeType: 'vec2' },
        { attributeName: 'origin', attributeType: 'vec2' },
        { attributeName: 'scaling', attributeType: 'vec2' },
        { attributeName: 'color', attributeType: 'vec4' },
        { attributeName: 'text', attributeType: 'float' }
    ];
    this.vertexBuffer = new VertexBuffer(this.graphics, vertexDeclaration);
    this.shaderProgram = new ShaderProgram(this.graphics, {
        vertexShaderFilename: 'lib/assets/spritebatch/vertex.glsl',
        geometryShaderFilename: 'lib/assets/spritebatch/geometry.glsl',
        fragmentShaderFilename: 'lib/assets/spritebatch/fragment.glsl'
    });
    this.shaderProgram.projection = mat4.ortho(
        mat4.create(), 0, window.width, window.height, 0, 0, -1);
    this.texture = null;
    this.vertices = [];
    this.drawCount = 0;
}

SpriteBatch.prototype.draw = function (options) {
    options = options || {};
    options.position = options.position || { x: 0, y: 0};
    options.rotation = options.rotation || 0;
    options.source = options.source || {
            x: 0, y: 0, w: options.texture.width, h: options.texture.height
        };
    options.origin = options.origin || { x: 0, y: 0};
    options.scaling = options.scaling || { x: 1, y: 1};
    options.color = options.color || { r: 1, g: 1, b: 1, a: 1};
    if (options.texture !== this.texture) {
        this.flush();
    }
    this.texture = options.texture;
    this.vertices.push.apply(this.vertices, [
        options.position.x, options.position.y,
        options.rotation,
        options.source.x, options.source.y, options.source.w, options.source.h,
        options.texture.width, options.texture.height,
        options.origin.x, options.origin.y,
        options.scaling.x, options.scaling.y,
        options.color.r, options.color.g, options.color.b, options.color.a,
        0
    ]);
    this.drawCount++;
};

SpriteBatch.prototype.drawString = function (options) {
    options = options || {};
    options.position = options.position || { x: 0, y: 0};
    options.rotation = options.rotation || 0;
    options.source = options.source || {
            x: 0, y: 0, w: options.font.texture.width, h: options.font.texture.height
        };
    options.origin = options.origin || { x: 0, y: 0};
    options.scaling = options.scaling || { x: 1, y: 1};
    options.color = options.color || { r: 1, g: 1, b: 1, a: 1};
    if (options.font.texture !== this.texture) {
        this.flush();
    }
    for (var i = 0; i < options.text.length; i++) {
        var c = options.text.charAt(i);
        var glyph = options.font.glyphs[c];
        var charOrigin = {
            x: options.origin.x - glyph.offset.x,
            y: options.origin.y + glyph.offset.y,
        };
        options.origin.x -= glyph.advance.x;
        options.origin.y -= glyph.advance.y;
        this.vertices.push.apply(this.vertices, [
            options.position.x, options.position.y,
            options.rotation,
            glyph.source.x, glyph.source.y, glyph.source.w, glyph.source.h,
            options.font.texture.width, options.font.texture.height,
            charOrigin.x, charOrigin.y,
            options.scaling.x, options.scaling.y,
            options.color.r, options.color.g, options.color.b, options.color.a,
            1
        ]);
        this.drawCount++;
    }
    this.texture = options.font.texture;
};

SpriteBatch.prototype.flush = function () {
    if (!this.texture || this.vertices.length === 0) {
        return;
    }
    this.graphics.textures[0] = this.texture;
    this.vertexBuffer.setData(this.vertices);
    this.graphics.setVertexBuffer(this.vertexBuffer);
    this.graphics.setShaderProgram(this.shaderProgram);
    this.graphics.drawPrimitives({
        primitiveType: 'pointList',
        vertexStart: 0,
        primitiveCount: this.drawCount
    });
    this.vertices = [];
    this.drawCount = 0;
};

var Sprite = function (spriteBatch, texture) {
  if (typeof texture === "string") {
    this.texture = new Texture(texture);
  } else {
    this.texture = texture;
  }
  this.position = new Vector();
  this.scaling = new Vector(1, 1);
  this.rotation = 0;
  this.color = Color.white();
  this.visible = true;
  this.origin = new Vector();
  this.spriteBatch = spriteBatch;
};

Sprite.prototype = Object.create(Component.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.center = function () {
  this.origin.x = this.texture.width / 2;
  this.origin.y = this.texture.height / 2;
};

Sprite.prototype.update = function (elapsed) {
  if (this.animation) {
    this.animation.update(elapsed);
  }
};

Sprite.prototype.draw = function () {
  if (!this.visible) {
    return;
  }
  var options = {
    texture: this.texture,
    position: this.position,
    color: this.color,
    origin: this.origin,
    rotation: this.rotation,
    scaling: this.scaling,
  };
  if (this.animation) {
    options.texture = this.animation.texture();
  }
  if (this.entity) {
    var spatial = this.entity.components.spatial;
    options.position = spatial.position;
    options.rotation = spatial.rotation;
    options.scaling = spatial.scaling;
  }
  this.spriteBatch.draw(options);
};

var SpriteAnimation = function (textures, fps) {
  this.textures = [];
  for (var i = 0; i < textures.length; i++) {
    if (typeof textures[i] === "string") {
      this.textures.push(new Texture(textures[i]));
    } else {
      this.textures.push(textures[i]);
    }
  }
  this.elapsed = 0;
  this.frame = 0;
  this.fps = fps || 20;
};

SpriteAnimation.prototype.update = function (elapsed) {
  this.elapsed += elapsed;
  if (this.elapsed >= 1.0 / this.fps) {
    this.frame = (this.frame + 1) % this.textures.length;
    this.elapsed -= 1.0 / this.fps;
  }
};

SpriteAnimation.prototype.texture = function () {
  return this.textures[this.frame];
};

module.exports.SpriteBatch = SpriteBatch;
module.exports.Sprite = Sprite;
module.exports.SpriteAnimation = SpriteAnimation;