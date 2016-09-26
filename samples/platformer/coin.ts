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
import { Level } from "./level";
import { Content } from "./content";

export class Coin extends $.Entity {
    collider: $.BoxCollider;
    lifeTime = 0;
    destroyed = false;
    destroyedTime = 0;
    startPosition: $.Vector3;
    sound: SoundSource;

    constructor(level: Level, name: string) {
        super();

        this.sound = new SoundSource(Content.SoundBuffers.coin);

        // Box collider for collision detection.
        this.collider = this.addComponent(
            new $.BoxCollider(new $.Vector3(0.35, 0.5, 1)));

        let coin = this.addComponent(new $.Sprite(
            level.spriteBatch, Content.Textures.coin));
        coin.pixelsPerUnit = 10;
        coin.origin = new $.Vector2(coin.width / 2, coin.height / 2);
        coin.drawOrder = 4;
    }

    draw() {
        if (!this.destroyed) {
            super.draw();
        }
    }

    update(elapsedTime: number) {
        super.update(elapsedTime);
        this.lifeTime += elapsedTime;

        if (!this.startPosition) {
            // Save starting position for floating animation.
            this.startPosition = this.transform.localPosition.copy();
        }

        // Animate with a floating effect.
        let float = Math.sin(this.lifeTime * 2 + this.startPosition.x) * 0.1;
        this.transform.localPosition.y = this.startPosition.y + float;

        if (!this.destroyed) {
            return;
        }
        this.destroyedTime += elapsedTime;
        if (this.destroyedTime >= 4) {
            // Bring back the coin after being destroyed for 4 seconds.
            this.destroyed = false;
            this.destroyedTime = 0;
        }
    }

    pickUp() {
        if (this.destroyed) {
            return;
        }
        this.sound.play();
        this.destroyed = true;
    }
}