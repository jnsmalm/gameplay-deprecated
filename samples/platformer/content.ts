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

import { SpriteAnimation, SpriteSheet } from "./animation"

export namespace Content {

    export namespace Textures {
        export let sky: Texture2D;
        export let clouds: Texture2D;
        export let platform: Texture2D;
        export let dirt: Texture2D;
        export let grass: Texture2D;
        export let coin: Texture2D;
    }

    export namespace SpriteSheets {
        export let idle: SpriteSheet;
        export let walk: SpriteSheet;
        export let jump: SpriteSheet;
    }

    export namespace SoundBuffers {
        export let coin: SoundBuffer;
        export let jump: SoundBuffer;
    }

    export function load() {
        Textures.sky = new Texture2D("./content/sky.png");
        Textures.sky.filter = "nearest";

        Textures.clouds = new Texture2D("./content/clouds.png");
        Textures.clouds.filter = "nearest";

        Textures.platform = new Texture2D("./content/platform.png");
        Textures.platform.filter = "nearest";

        Textures.dirt = new Texture2D("./content/dirt.png");
        Textures.dirt.filter = "nearest";

        Textures.grass = new Texture2D("./content/grass.png");
        Textures.grass.filter = "nearest";

        Textures.coin = new Texture2D("./content/coin.png");
        Textures.coin.filter = "nearest";

        SpriteSheets.walk = new SpriteSheet(
            new Texture2D("./content/walk.png"));
        SpriteSheets.walk.texture.filter = "nearest";
        for (let i = 0; i < 4; i++) {
            SpriteSheets.walk.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            }
        }

        SpriteSheets.idle = new SpriteSheet(
            new Texture2D("./content/idle.png"));
        for (let i = 0; i < 14; i++) {
            SpriteSheets.idle.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            }
        }
        SpriteSheets.idle.texture.filter = "nearest";

        SpriteSheets.jump = new SpriteSheet(
            new Texture2D("./content/jump.png"));
        for (let i = 0; i < 11; i++) {
            SpriteSheets.jump.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            }
        }
        SpriteSheets.jump.texture.filter = "nearest";

        SoundBuffers.coin = new SoundBuffer("./content/coin.ogg");
        SoundBuffers.jump = new SoundBuffer("./content/jump.ogg");
    }
}