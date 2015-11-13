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
    // Calculate the uv texture coordinates.
    this.u1 = sprite.sourceRect[0] / sprite.texture.width;
    this.u2 = sprite.sourceRect[2] / sprite.texture.width + this.u1;
    this.v1 = sprite.sourceRect[1] / sprite.texture.height;
    this.v2 = sprite.sourceRect[3] / sprite.texture.height + this.v1;

    // Calculate the half width / height.
    var hw = sprite.sourceRect[2] / sprite.pixelsPerUnit / 2;
    var hh = sprite.sourceRect[3] / sprite.pixelsPerUnit / 2;

    // Set vertex positions and transform.
    this.p1.set(-hw, hh, 0).transform(sprite.transform, this.p1);
    this.p2.set( hw, hh, 0).transform(sprite.transform, this.p2);
    this.p3.set(-hw,-hh, 0).transform(sprite.transform, this.p3);
    this.p4.set( hw,-hh, 0).transform(sprite.transform, this.p4);
};

function SpriteBatch(window) {
    this.graphics = window.graphics;

    var aspectRatio = window.width/window.height;
    var h = 5;
    var w = 5 * aspectRatio;

    this.shaderProgram = new ShaderProgram(this.graphics,
        module.path + 'assets/shaders/sprite');
    this.shaderProgram.projection = Matrix.ortho(-w, w, -h, h, -100, 100);

    this.vertexDataState = new VertexDataState(this.graphics);
    this.vertexDataState.setVertexDeclaration(vertexDeclaration,
        this.shaderProgram);

    this.vertices = new NumberArray();
    this.indices = new NumberArray();
    this.texture = null;
    this.spriteCount = 0;
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

    return function(sprite) {
        if (sprite.texture !== this.texture) {
            this.flush();
        }
        this.texture = sprite.texture;

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

function Sprite(texture) {
    if (typeof texture === 'string') {
        this.texture = new Texture2D(texture);
    } else {
        this.texture = texture;
    }
    this.transform = new Matrix();
    this.color = Color.white();
    this.pixelsPerUnit = 100;
    this.sourceRect = [0, 0, this.texture.width, this.texture.height];
}

function SpriteComponent(spriteBatch, texture) {
    Component.call(this);
    this.spriteBatch = spriteBatch;
    this.sprite = new Sprite(texture);
}

var _sprites = [];

SpriteComponent.draw = function() {
    if (_sprites.length === 0) {
        return;
    }
    var batches = [];
    for (var i=0; i<_sprites.length; i++) {
        if (!_sprites[i].spriteBatch.hasBegun) {
            _sprites[i].spriteBatch.begin();
            batches.push(_sprites[i].spriteBatch);
            _sprites[i].spriteBatch.hasBegun = true;
        }
        _sprites[i].spriteBatch.draw(_sprites[i].sprite);
    }
    for (i=0; i<batches.length; i++) {
        batches[i].end();
        _sprites[i].spriteBatch.hasBegun = false;
    }
    _sprites = [];
};

Utils.extend(SpriteComponent, Component);

SpriteComponent.prototype.draw = function () {
    var transform = this.entity.transform;
    this.sprite.transform = transform.world;
    _sprites.push(this);
};

module.exports.SpriteBatch = SpriteBatch;
module.exports.Sprite = Sprite;
module.exports.SpriteComponent = SpriteComponent;