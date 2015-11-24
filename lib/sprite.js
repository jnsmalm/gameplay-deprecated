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

var Vector3 = require('/matrix.js').Vector3;
var Matrix = require('/matrix.js').Matrix;
var Component = require('/entity.js').Component;
var Color = require('/color.js').Color;
var Utils = require('/utils.js').Utils;

vertexDeclaration = [
    { name: 'position', type: 'vec3' },
    { name: 'textureCoords', type: 'vec2' },
    { name: 'color', type: 'vec4' }
];

function SpriteVertexData() {
    this.p1 = new Vector3();
    this.p2 = new Vector3();
    this.p3 = new Vector3();
    this.p4 = new Vector3();
}

SpriteVertexData.prototype.setup = function(sprite) {
    this.u1 = sprite.sourceRect[0] / sprite.texture.width;
    this.u2 = sprite.sourceRect[2] / sprite.texture.width + this.u1;
    this.v1 = sprite.sourceRect[1] / sprite.texture.height;
    this.v2 = sprite.sourceRect[3] / sprite.texture.height + this.v1;

    var w = sprite.sourceRect[2] / sprite.pixelsPerUnit;
    var h = sprite.sourceRect[3] / sprite.pixelsPerUnit;

    var x = sprite.origin[0] / sprite.pixelsPerUnit;
    var y = sprite.origin[1] / sprite.pixelsPerUnit;

    this.p1.set(-x,  y,  0).transform(sprite.transform, this.p1);
    this.p2.set(-x+w,y,  0).transform(sprite.transform, this.p2);
    this.p3.set(-x,  y-h,0).transform(sprite.transform, this.p3);
    this.p4.set(-x+w,y-h,0).transform(sprite.transform, this.p4);
};

function SpriteBatch(window) {
    this.graphics = window.graphics;
    this.shaderProgram = new ShaderProgram(this.graphics,
        module.path + 'assets/shaders/sprite');

    var aspectRatio = window.width/window.height;
    this.shaderProgram.viewProjection =
        Matrix.ortho(-5 * aspectRatio, 5 * aspectRatio, -5, 5, -1000, 1000);

    this.vertexDataState = new VertexDataState(this.graphics);
    this.vertexDataState.setVertexDeclaration(vertexDeclaration,
        this.shaderProgram);

    this.vertices = new NumberArray();
    this.indices = new NumberArray();
    this.texture = null;
    this.spriteCount = 0;

    Object.defineProperty(this, 'viewProjection', {
        set: function(value) {
            this.shaderProgram.viewProjection = value;
        }
    });

    Object.defineProperty(this, '_drawAsText', {
        set: (function() {
            var _drawAsText = 0;

            return function(value) {
                if (value) {
                    value = 1;
                } else {
                    value = 0;
                }
                if (value !== _drawAsText) {
                    this.shaderProgram.drawAsText = value;
                    _drawAsText = value;
                }
            }
        })()
    });
}

SpriteBatch.prototype.begin = function() {
    this.graphics.setVertexDataState(this.vertexDataState);
    this.graphics.setShaderProgram(this.shaderProgram);
    this.graphics.setBlendState('alphaBlend');
    this.graphics.setDepthState('none');
};

SpriteBatch.prototype.end = function() {
    this.flush();
};

SpriteBatch.prototype.draw = (function() {
    var _d = new SpriteVertexData();

    return function(sprite, drawAsText) {
        if (sprite.texture !== this.texture) {
            this.flush();
        }
        this.texture = sprite.texture;
        this._drawAsText = drawAsText;

        _d.setup(sprite);
        var c = sprite.color;

        this.vertices.push(
            _d.p1[0], _d.p1[1], _d.p1[2], _d.u1, _d.v1, c[0], c[1], c[2], c[3],
            _d.p2[0], _d.p2[1], _d.p2[2], _d.u2, _d.v1, c[0], c[1], c[2], c[3],
            _d.p3[0], _d.p3[1], _d.p3[2], _d.u1, _d.v2, c[0], c[1], c[2], c[3],
            _d.p4[0], _d.p4[1], _d.p4[2], _d.u2, _d.v2, c[0], c[1], c[2], c[3]
        );

        this.indices.push(
            this.spriteCount * 4 + 0,
            this.spriteCount * 4 + 3,
            this.spriteCount * 4 + 2,
            this.spriteCount * 4 + 0,
            this.spriteCount * 4 + 1,
            this.spriteCount * 4 + 3
        );

        this.spriteCount++;
    }
})();

SpriteBatch.prototype.drawText = function(spriteText) {
    var glyphs = spriteText.font.glyphs;
    var origin = { x: 0, y: 0 };
    var glyph = glyphs[spriteText.text[0]];

    switch (spriteText.align) {
        case 'left':
            origin.x = 0;
            break;
        case 'right':
            origin.x = spriteText.font.measureString(spriteText.text);
            break;
        case 'center':
        default:
            origin.x = spriteText.font.measureString(spriteText.text) / 2;
            break;
    }

    switch (spriteText.baseline) {
        case 'alphabetic':
            origin.y = 0;
            break;
        case 'top':
            origin.y = -glyph.offset.y;
            break;
        case 'middle':
        default:
            origin.y = -glyph.offset.y / 2;
            break;
    }

    var sprite = new Sprite({
        texture: spriteText.font.texture,
        color: spriteText.color,
        transform: spriteText.transform,
        pixelsPerUnit: spriteText.pixelsPerUnit,
        origin: [0, 0]
    });

    for (var i = 0; i < spriteText.text.length; i++) {
        glyph = glyphs[spriteText.text.charAt(i)];

        sprite.sourceRect[0] = glyph.source.x;
        sprite.sourceRect[1] = glyph.source.y;
        sprite.sourceRect[2] = glyph.source.w;
        sprite.sourceRect[3] = glyph.source.h;

        sprite.origin[0] = origin.x - glyph.offset.x;
        sprite.origin[1] = origin.y + glyph.offset.y;

        this.draw(sprite, true);

        origin.x -= glyph.advance.x;
        origin.y -= glyph.advance.y;
    }
};

SpriteBatch.prototype.flush = function() {
    if (!this.texture || this.spriteCount === 0) {
        return;
    }
    this.graphics.textures[0] = this.texture;
    this.vertexDataState.setVertices(this.vertices, 'dynamic');
    this.vertexDataState.setIndices(this.indices, 'dynamic');

    this.graphics.drawIndexedPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: this.spriteCount * 2
    });

    this.vertices.clear();
    this.indices.clear();
    this.spriteCount = 0;
};

function Sprite(options) {
    options = Utils.options(options, this);

    if (typeof options.texture === 'string') {
        this.texture = new Texture2D(options.texture);
    } else {
        this.texture = options.texture;
    }

    options.value('sourceRect',
        [0, 0, this.texture.width, this.texture.height]);
    options.value('origin',
        [this.texture.width / 2, this.texture.height / 2]);
    options.value('color', Color.white());
    options.value('transform', new Matrix());
    options.value('pixelsPerUnit', 100);
}

function SpriteText(options) {
    options = Utils.options(options, this);
    options.value('font');
    options.value('color', Color.white());
    options.value('align', 'center');
    options.value('baseline', 'middle');
    options.value('transform', new Matrix());
    options.value('pixelsPerUnit', 100);
    options.value('text', '');
}

function SpriteComponent(options) {
    Component.call(this);
    options = Utils.options(options, this);
    options.value('spriteBatch', null);
    this.sprite = new Sprite(options);

    Object.defineProperty(this, 'color', {
        get: function() {
            return this.sprite.color;
        },
        set: function(value) {
            this.sprite.color = value;
        }
    });
}

Utils.extend(SpriteComponent, Component);

SpriteComponent.prototype.draw = function () {
    var transform = this.entity.transform;
    this.sprite.transform = transform.world;
    this.spriteBatch.draw(this.sprite);
};

function SpriteTextComponent(options) {
    Component.call(this);
    options = Utils.options(options, this);
    options.value('spriteBatch', null);
    this.spriteText = new SpriteText(options);

    Object.defineProperty(this, 'text', {
        get: function() {
            return this.spriteText.text;
        },
        set: function(value) {
            this.spriteText.text = value;
        }
    });
}

Utils.extend(SpriteTextComponent, Component);

SpriteTextComponent.prototype.draw = function () {
    var transform = this.entity.transform;
    this.spriteText.transform = transform.world;
    this.spriteBatch.drawText(this.spriteText);
};

module.exports.SpriteBatch = SpriteBatch;
module.exports.SpriteText = SpriteText;
module.exports.SpriteTextComponent = SpriteTextComponent;
module.exports.Sprite = Sprite;
module.exports.SpriteComponent = SpriteComponent;