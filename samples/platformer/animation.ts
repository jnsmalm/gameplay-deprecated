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

import * as $ from "../../lib/lib"

interface SpriteFrameCollection {
    [name: string]: {
        frame: Rectangle
    }
}

export class SpriteSheet {
    public frames: SpriteFrameCollection = {};

    constructor(public texture: Texture2D) { }

    static createFromFile(filePath: string, texture: Texture2D) {
        let sheet = new SpriteSheet(texture);
        sheet.frames = <SpriteFrameCollection>JSON.parse(
            file.readText(filePath)).frames;
        return sheet;
    }
}

interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class SpriteAnimation {
    private frameIndex = 0;
    private frameTime = 0;

    constructor(private sheet: SpriteSheet,
        private frames?: string[], public fps = 20, public loop = true) {
        if (!frames) {
            this.frames = [];
            for (let name in sheet.frames) {
                this.frames.push(name);
            }
        }
    }

    reset() {
        this.frameIndex = 0;
        this.frameTime = 0;
    }

    animate(sprite: $.Sprite) {
        if (!this.frames) {
            return;
        }
        let frame = this.sheet.frames[this.frames[this.frameIndex]].frame;
        sprite.texture = this.sheet.texture;
        sprite.source.x = frame.x;
        sprite.source.y = frame.y;
        sprite.source.width = frame.w;
        sprite.source.height = frame.h;
    }

    update(elapsedTime: number) {
        if (!this.frames) {
            return;
        }
        if (!this.loop && this.frameIndex === this.frames.length - 1) {
            // This animation doesn't loop and we have reached the last frame.
            return;
        }
        if ((this.frameTime += elapsedTime) > 1 / this.fps) {
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.frameTime -= 1 / this.fps;
        }
    }
}