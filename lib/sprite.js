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
"use strict";
const color_1 = require("./color");
const utils_1 = require("./utils");
const transform_1 = require("./transform");
const math_1 = require("./math");
const matrix4 = new utils_1.Pool(math_1.Matrix4, 5);
const vector2 = new utils_1.Pool(math_1.Vector2, 5);
class Rectangle {
    /**
     * Creates a new rectangle.
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    /**
     * Returns the right coordinate.
     */
    get r() {
        return this.x + this.width;
    }
    /**
     * Returns the bottom coordinate.
     */
    get b() {
        return this.y + this.height;
    }
    /**
     * Divides a rectangle by the given x, y.
     */
    static divide(r, x, y) {
        return new Rectangle(r.x / x, r.y / y, r.width / x, r.height / y);
    }
}
/**
 * Represents a sprite.
 */
class Sprite {
    /**
     * Creates a new sprite.
     */
    constructor(spriteBatch, texture = null) {
        this.spriteBatch = spriteBatch;
        this.texture = texture;
        this.color = color_1.Color.white;
        this.transform = new transform_1.Transform();
        this.pixelsPerUnit = 100;
        this.drawOrder = 0;
        this.source = new Rectangle(0, 0, this.texture ?
            this.texture.width : 0, this.texture ? this.texture.height : 0);
        this.origin = new math_1.Vector2(this.width / 2, this.height / 2);
    }
    /**
     * Returns the width in units.
     */
    get width() {
        return this.source.width / this.pixelsPerUnit;
    }
    /**
     * Returns the height in units.
     */
    get height() {
        return this.source.height / this.pixelsPerUnit;
    }
    /**
     * Attaches the sprite to a transform.
     */
    attach(transform) {
        this.transform.parent = transform;
    }
    /**
     * Adds the sprite to the spritebatch.
     */
    draw() {
        this.spriteBatch.addSprite(this);
    }
    /**
     * Returns the rectangle without rotation and scale in local-space.
     */
    getRectangle() {
        return new Rectangle(-this.origin[0], this.origin[1], this.width, -this.height);
    }
    /**
     * Loads a texture from the given file path and creates a new sprite.
     */
    static createFromFile(filePath, spriteBatch) {
        return new Sprite(spriteBatch, new Texture2D(filePath));
    }
}
exports.Sprite = Sprite;
class SpriteBatch {
    /**
     * Creates a new spritebatch.
     */
    constructor(graphics, camera) {
        this.graphics = graphics;
        this.camera = camera;
        this.sprites = [];
        this.vertices = new SpriteVertexArray();
        this.indicies = new SpriteIndexArray();
        this.program = new ShaderProgram(this.graphics, module.path + '/content/shaders/sprite');
        this.vertexSpecification = new VertexSpecification(this.graphics, ['vec3', 'vec2', 'vec4']);
    }
    /**
     * Sets up the render states needed before drawing.
     */
    setupState(blendState, depthState) {
        this.graphics.blendState = blendState;
        this.graphics.depthState = depthState;
        this.graphics.setVertexSpecification(this.vertexSpecification);
        this.graphics.setShaderProgram(this.program);
        this.program['viewProjection'] =
            this.camera.getViewProjection(matrix4.next);
    }
    /**
     * Sorts the sprites based on texture.
     */
    sortByTexture(a, b) {
        if (a.drawOrder === b.drawOrder) {
            return a.texture.id - b.texture.id;
        }
        return a.drawOrder - b.drawOrder;
    }
    /**
     * Adds a sprite to the list of sprites to be drawn.
     */
    addSprite(sprite) {
        this.sprites.push(sprite);
    }
    /**
     * Draw sprites that has been added.
     */
    draw(blendState = "alphaBlend", depthState = "none") {
        if (this.sprites.length === 0) {
            return;
        }
        var savedState = {
            blendState: this.graphics.blendState,
            depthState: this.graphics.depthState
        };
        this.setupState(blendState, depthState);
        this.sprites.sort(this.sortByTexture);
        let numberOfSpritesInBatch = 0;
        let drawOrder = this.sprites[0].drawOrder;
        let texture = this.sprites[0].texture;
        for (let sprite of this.sprites) {
            if (sprite.texture !== texture || sprite.drawOrder !== drawOrder) {
                this.drawBatch(texture, numberOfSpritesInBatch);
                numberOfSpritesInBatch = 0;
                drawOrder = sprite.drawOrder;
                texture = sprite.texture;
            }
            this.vertices.addVertices(sprite);
            this.indicies.addIndicies(numberOfSpritesInBatch * 4);
            numberOfSpritesInBatch++;
        }
        this.sprites.length = 0;
        this.drawBatch(texture, numberOfSpritesInBatch);
        this.graphics.blendState = savedState.blendState;
        this.graphics.depthState = savedState.depthState;
    }
    /**
     * Draws a batch of sprites that has the same texture.
     */
    drawBatch(texture, numberOfSprites) {
        this.vertexSpecification.setVertexData(new Float32Array(this.vertices), "stream");
        this.vertexSpecification.setIndexData(new Int32Array(this.indicies), "stream");
        this.vertices.length = this.indicies.length = 0;
        this.graphics.textures[0] = texture;
        this.graphics.drawIndexedPrimitives({
            primitiveType: "triangleList", primitiveCount: numberOfSprites * 2
        });
    }
}
exports.SpriteBatch = SpriteBatch;
class SpriteVertexArray extends Array {
    constructor() {
        super(...arguments);
        this.vector = new math_1.Vector3();
        this.matrix = new math_1.Matrix4();
    }
    /**
     * Adds vertex data for a sprite.
     */
    addVertices(sprite) {
        let world = sprite.transform.getWorldMatrix(this.matrix);
        let uv = Rectangle.divide(sprite.source, sprite.texture.width, sprite.texture.height);
        let color = sprite.color;
        let rect = sprite.getRectangle();
        this.addVertex(rect.x, rect.y, uv.x, uv.y, color, world);
        this.addVertex(rect.r, rect.y, uv.r, uv.y, color, world);
        this.addVertex(rect.x, rect.b, uv.x, uv.b, color, world);
        this.addVertex(rect.r, rect.b, uv.r, uv.b, color, world);
    }
    /**
     * Adds an sprite vertex at the given local-space coordinates.
     */
    addVertex(x, y, u, v, c, m) {
        this.vector[0] = x;
        this.vector[1] = y;
        this.vector[2] = 0;
        let t = this.vector.transform(m, this.vector);
        this.push(t[0], t[1], t[2], u, v, c[0], c[1], c[2], c[3]);
    }
}
class SpriteIndexArray extends Array {
    /**
     * Adds indicies starting at the given offset.
     */
    addIndicies(offset) {
        this.push(offset, offset + 2, offset + 3, offset, offset + 3, offset + 1);
    }
}
class SpriteText {
    /** Creates a new SpriteFont. */
    constructor(text, font, spriteBatch) {
        this.text = text;
        this.font = font;
        this.spriteBatch = spriteBatch;
        /** Each character in a string is represented by a sprite. */
        this.sprites = [];
        this.alignment = 'center';
        this.color = color_1.Color.white;
        this.transform = new transform_1.Transform();
        this.pixelsPerUnit = 100;
    }
    /** Attaches the SpriteText to a Transform. */
    attach(transform) {
        this.transform.parent = transform;
    }
    draw() {
        // Make sure we have enough sprites to draw text.
        while (this.sprites.length < this.text.length) {
            let sprite = new Sprite(this.spriteBatch, this.font.texture);
            this.sprites.push(sprite);
        }
        if (this.alignment == 'center') {
            var origin = vector2.next.xy(this.font.measureString(this.text) / 2, 0);
        }
        else if (this.alignment == 'left') {
            var origin = vector2.next.xy(0, 0);
        }
        else if (this.alignment == 'right') {
            var origin = vector2.next.xy(this.font.measureString(this.text), 0);
        }
        for (var i = 0; i < this.text.length; i++) {
            let glyph = this.font.glyphs[this.text.charAt(i)];
            let sprite = this.sprites[i];
            sprite.pixelsPerUnit = this.pixelsPerUnit;
            sprite.color = this.color;
            sprite.transform = this.transform;
            sprite.origin.x =
                (origin.x - glyph.offset.x) / this.pixelsPerUnit;
            sprite.origin.y =
                (origin.y + glyph.offset.y) / this.pixelsPerUnit;
            sprite.source.width = glyph.source.width;
            sprite.source.height = glyph.source.height;
            sprite.source.x = glyph.source.x;
            sprite.source.y = glyph.source.y;
            origin[0] -= glyph.advance.x;
            origin[1] -= glyph.advance.y;
            this.spriteBatch.addSprite(this.sprites[i]);
        }
    }
}
exports.SpriteText = SpriteText;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ByaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3ByaXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFFWCxtQ0FBK0I7QUFDL0IsbUNBQThCO0FBQzlCLDJDQUF1QztBQUN2QyxpQ0FBa0Q7QUFHbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFJLENBQUMsY0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sT0FBTyxHQUFHLElBQUksWUFBSSxDQUFDLGNBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVyQztJQUNJOztPQUVHO0lBQ0gsWUFDVyxJQUFJLENBQUMsRUFBUyxJQUFJLENBQUMsRUFBUyxRQUFRLENBQUMsRUFBUyxTQUFTLENBQUM7UUFBeEQsTUFBQyxHQUFELENBQUMsQ0FBSTtRQUFTLE1BQUMsR0FBRCxDQUFDLENBQUk7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFJO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBSTtJQUFJLENBQUM7SUFDeEU7O09BRUc7SUFDSCxJQUFJLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQy9CLENBQUM7SUFDRDs7T0FFRztJQUNILElBQUksQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFZLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDNUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEUs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