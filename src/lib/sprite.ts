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

import { Color } from "./color"
import { Pool } from "./utils"
import { Transform } from "./transform"
import { Vector2, Vector3, Matrix4 } from "./math"
import { Camera } from "./camera"

const matrix4 = new Pool(Matrix4, 5);
const vector2 = new Pool(Vector2, 5);

class Rectangle {
    /**
     * Creates a new rectangle.
     */
    constructor(
        public x = 0, public y = 0, public width = 0, public height = 0) { }
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
    static divide(r: Rectangle, x: number, y: number) {
        return new Rectangle(r.x / x, r.y / y, r.width / x, r.height / y);
    }
}
/**
 * Represents a sprite.
 */
export class Sprite {
    public source: Rectangle;
    public color = Color.white;
    public transform = new Transform();
    public pixelsPerUnit = 100;
    public origin: Vector2;
    /**
     * Creates a new sprite.
     */
    constructor(public spriteBatch: SpriteBatch, public texture: Texture2D = null) {
        this.source = new Rectangle(0, 0, this.texture ?
            this.texture.width : 0, this.texture ? this.texture.height : 0);
        this.origin = new Vector2(this.width / 2, this.height / 2);
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
    attach(transform: Transform) {
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
        return new Rectangle(
            -this.origin[0], this.origin[1], this.width, -this.height);
    }
    /**
     * Loads a texture from the given file path and creates a new sprite.
     */
    static createFromFile(filePath: string, spriteBatch: SpriteBatch) {
        return new Sprite(spriteBatch, new Texture2D(filePath));
    }
}

export class SpriteBatch {
    private program: ShaderProgram;
    private vertexSpecification: VertexSpecification;
    private sprites: Sprite[] = [];
    private vertices = new SpriteVertexArray();
    private indicies = new SpriteIndexArray();
    /**
     * Creates a new spritebatch.
     */
    constructor(public graphics: Graphics, public camera: Camera) {
        this.program = new ShaderProgram(
            this.graphics, module.path + '/content/shaders/sprite');
        this.vertexSpecification = new VertexSpecification(
            this.graphics, ['vec3', 'vec2', 'vec4']);
    }
    /**
     * Sets up the render states needed before drawing.
     */
    private setupState(blendState: BlendState, depthState: DepthState) {
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
    sort(a: Sprite, b: Sprite) {
        return a.texture.id - b.texture.id;
    }
    /**
     * Adds a sprite to the list of sprites to be drawn.
     */
    addSprite(sprite: Sprite) {
        this.sprites.push(sprite);
    }
    /**
     * Draw sprites that has been added.
     */
    draw(blendState: BlendState = 'alphaBlend', depthState: DepthState = 'none') {
        if (this.sprites.length === 0) {
            return;
        }
        var savedState = {
            blendState: this.graphics.blendState,
            depthState: this.graphics.depthState
        };
        this.setupState(blendState, depthState);
        this.sprites.sort(this.sort);

        let numberOfSpritesInBatch = 0;
        let texture = this.sprites[0].texture;

        for (let sprite of this.sprites) {
            if (sprite.texture !== texture) {
                this.drawBatch(texture, numberOfSpritesInBatch);
                numberOfSpritesInBatch = 0;
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
    private drawBatch(texture: Texture2D, numberOfSprites: number) {
        this.vertexSpecification.setVertexData(
            new Float32Array(this.vertices), "stream");
        this.vertexSpecification.setIndexData(
            new Int32Array(this.indicies), "stream");
        this.vertices.length = this.indicies.length = 0;

        this.graphics.textures[0] = texture;
        this.graphics.drawIndexedPrimitives({
            primitiveType: "triangleList", primitiveCount: numberOfSprites * 2
        });
    }
}

class SpriteVertexArray extends Array<number> {
    private vector = new Vector3();
    private matrix = new Matrix4();
    /**
     * Adds vertex data for a sprite.
     */
    addVertices(sprite: Sprite) {
        let world = sprite.transform.getWorldMatrix(this.matrix);
        let uv = Rectangle.divide(
            sprite.source, sprite.texture.width, sprite.texture.height);
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
    private addVertex(
        x: number, y: number, u: number, v: number, c: Color, m: Matrix4) {
            
        this.vector[0] = x;
        this.vector[1] = y;
        this.vector[2] = 0;

        let t = this.vector.transform(m, this.vector);
        this.push(t[0], t[1], t[2], u, v, c[0], c[1], c[2], c[3]);
    }
}

class SpriteIndexArray extends Array<number> {
    /**
     * Adds indicies starting at the given offset.
     */
    addIndicies(offset: number) {
        this.push(offset, offset + 3, offset + 2, offset, offset + 1, offset + 3);
    }
}

type TextAlignment = 'left' | 'right' | 'center';

export class SpriteText {
    /** Each character in a string is represented by a sprite. */
    public sprites: Sprite[] = [];

    public alignment: TextAlignment = 'center';
    public color = Color.white;
    public transform = new Transform();
    public pixelsPerUnit = 100;

    /** Creates a new SpriteFont. */
    constructor(public text: string, 
        public font: TextureFont, private spriteBatch: SpriteBatch) { }
    
    /** Attaches the SpriteText to a Transform. */
    attach(transform: Transform) {
        this.transform.parent = transform;
    }

    draw() {
        // Make sure we have enough sprites to draw text.
        while (this.sprites.length < this.text.length) {
            let sprite = new Sprite(this.spriteBatch, this.font.texture);
            this.sprites.push(sprite);
        }
        if (this.alignment == 'center') {
            var origin = vector2.next.xy(
                this.font.measureString(this.text) / 2, 0);
        } else if (this.alignment == 'left') {
            var origin = vector2.next.xy(0, 0);
        } else if (this.alignment == 'right') {
            var origin = vector2.next.xy(
                this.font.measureString(this.text), 0);
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