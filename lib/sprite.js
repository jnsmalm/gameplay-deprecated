var mat4 = require("/gl-matrix/mat4.js");

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

function DefaultSprite() {
    this.position = { x: 0, y: 0 };
    this.source = { x: 0, y: 0, w: 0, h: 0 };
    this.scaling = { x: 1, y: 1 };
    this.rotation = 0;
    this.origin = { x: 0, y: 0 };
    this.color = { r: 1, g: 1, b: 1, a: 1 };
    this.drawAsText = 0;
}

// Creates an array with vertex data that is later stored in the vertex buffer.
// The order of these properties must match the above vertex declaration.
DefaultSprite.prototype.toArray = function () {
    return [
        // Position
        this.position.x, this.position.y,
        // Rotation
        this.rotation,
        // Source
        this.source.x, this.source.y, this.source.w, this.source.h,
        // Texture Size
        this.texture.width, this.texture.height,
        // Origin
        this.origin.x, this.origin.y,
        // Scaling
        this.scaling.x, this.scaling.y,
        // Color
        this.color.r, this.color.g, this.color.b, this.color.a,
        // Draw as text
        this.drawAsText
    ];
};

DefaultSprite.prototype.resetAsSprite = function (sprite, texture) {
    this.texture = texture;
    if (sprite.position) {
        this.position.x = sprite.position.x;
        this.position.y = sprite.position.y;
    } else {
        this.position.x = 0;
        this.position.y = 0;
    }
    if (sprite.scaling) {
        this.scaling.x = sprite.scaling.x;
        this.scaling.y = sprite.scaling.y;
    } else {
        this.scaling.x = 1;
        this.scaling.y = 1;
    }
    if (sprite.origin) {
        this.origin.x = sprite.origin.x;
        this.origin.y = sprite.origin.y;
    } else {
        this.origin.x = 0;
        this.origin.y = 0;
    }
    if (sprite.color) {
        this.color.r = sprite.color.r;
        this.color.g = sprite.color.g;
        this.color.b = sprite.color.b;
        this.color.a = sprite.color.a;
    } else {
        this.color.r = 1;
        this.color.g = 1;
        this.color.b = 1;
        this.color.a = 1;
    }
    if (sprite.source) {
        this.source.x = sprite.source.x;
        this.source.y = sprite.source.y;
        this.source.w = sprite.source.w;
        this.source.h = sprite.source.h;
    } else {
        this.source.x = 0;
        this.source.y = 0;
        this.source.w = texture.width;
        this.source.h = texture.height;
    }
    if (sprite.rotation) {
        this.rotation = sprite.rotation;
    } else {
        this.rotation = 0;
    }
    if (sprite.drawAsText) {
        this.drawAsText = sprite.drawAsText;
    } else {
        this.drawAsText = 0;
    }
    return this;
}

DefaultSprite.prototype.resetAsText = function (text) {
    defaultSprite = this.resetAsSprite(text, text.font.texture);
    defaultSprite.drawAsText = 1;
    if (text.baseline) {
        defaultSprite.baseline = text.baseline;
    } else {
        defaultSprite.baseline = 'top';
    }
    return defaultSprite;
}

var defaultSprite = new DefaultSprite();

function SpriteBatch (window) {
    this.graphics = window.graphics;
    this.vertexBuffer = new VertexBuffer(this.graphics, vertexDeclaration);
    this.shaderProgram = new ShaderProgram(this.graphics,
        module.path + 'assets/shaders/sprite');
    this.shaderProgram.projection = mat4.ortho(
        mat4.create(), 0, window.width, window.height, 0, 0, -1);
    this.texture = null;
    this.vertices = [];
    this.drawCount = 0;
}

SpriteBatch.prototype.begin = function () {
    this.graphics.setVertexBuffer(this.vertexBuffer);
    this.graphics.setShaderProgram(this.shaderProgram);
};

SpriteBatch.prototype.end = function () {
    this.flush();
};

SpriteBatch.prototype.draw = function (sprite) {
    if (typeof sprite !== 'object') {
        throw new TypeError('Argument must be an object');
    }
    if (!sprite.texture) {
        throw new TypeError('Missing texture when drawing sprite.');
    }
    defaultSprite.resetAsSprite(sprite, sprite.texture);
    if (defaultSprite.texture !== this.texture) {
        this.flush();
    }
    this.texture = defaultSprite.texture;
    this.vertices.push.apply(this.vertices, defaultSprite.toArray());
    this.drawCount++;
};

SpriteBatch.prototype.drawText = function (text) {
    if (typeof text !== 'object') {
        throw new TypeError('Argument must be an object');
    }
    if (!text.font) {
        throw new TypeError('Missing font when drawing text.');
    }
    if (typeof text.text !== 'string') {
        throw new TypeError('Missing text when drawing text.');
    }
    defaultSprite.resetAsText(text);
    var origin = { x: defaultSprite.origin.x, y: 0 };

    if (defaultSprite.baseline === 'top') {
        var glyph = text.font.glyphs[text.text[0]];
        origin.y = defaultSprite.origin.y - glyph.offset.y;
    }
    if (defaultSprite.baseline === 'middle') {
        var glyph = text.font.glyphs[text.text[0]];
        origin.y = defaultSprite.origin.y - glyph.offset.y / 2;
    }
    if (defaultSprite.baseline === 'alphabetic') {
        origin.y = defaultSprite.origin.y;
    }

    for (var i = 0; i < text.text.length; i++) {
        var glyph = text.font.glyphs[text.text.charAt(i)];
        defaultSprite.source.x = glyph.source.x;
        defaultSprite.source.y = glyph.source.y;
        defaultSprite.source.w = glyph.source.w;
        defaultSprite.source.h = glyph.source.h;
        defaultSprite.origin.x = origin.x - glyph.offset.x;
        defaultSprite.origin.y = origin.y + glyph.offset.y;
        this.draw(defaultSprite);
        origin.x -= glyph.advance.x;
        origin.y -= glyph.advance.y;
    }
};

SpriteBatch.prototype.flush = function () {
    if (!this.texture || this.vertices.length === 0) {
        return;
    }
    this.graphics.textures[0] = this.texture;
    this.vertexBuffer.setData(this.vertices, 'dynamic');
    this.graphics.drawPrimitives({
        primitiveType: 'pointList',
        vertexStart: 0,
        primitiveCount: this.drawCount
    });
    this.vertices = [];
    this.drawCount = 0;
};

var Sprite = function (spriteBatch, texture) {
  if (typeof texture === 'string') {
    this.texture = new Texture2D(texture);
  } else {
    this.texture = texture;
  }
  this.position = { x: 0, y: 0 };
  this.scaling = { x: 1, y: 1 };
  this.rotation = 0;
  this.color = { r: 1, g: 1, b: 1, a: 1 };
  this.visible = true;
  this.origin = { x: 0, y: 0 };
  this.spriteBatch = spriteBatch;
};

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
  if (this.animation) {
    options.texture = this.animation.texture();
  }
  this.spriteBatch.draw(this);
};

var SpriteAnimation = function (textures, fps) {
  this.textures = [];
  for (var i = 0; i < textures.length; i++) {
    if (typeof textures[i] === 'string') {
      this.textures.push(new Texture2D(textures[i]));
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