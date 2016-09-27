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
import { Player } from "./player"
import { Platform } from "./platform"
import { Coin } from "./coin"
import { Content } from "./content"

$.RigidBody.gravity.y = -55;

namespace Collision {
    /** 
     * Minimum translation vector is the shortest distance that the
     * colliding object can be moved in order to no longer be colliding with
     * the other object.
     * */
    export const mtv = new $.Vector3();
}

export class Level {
    camera: $.Camera;
    spriteBatch: $.SpriteBatch;
    player: Player;
    playerStart = new $.Vector3();
    platforms: Platform[] = [];
    coins: Coin[] = [];
    sky: $.Sprite;
    clouds: $.Sprite;

    constructor() {
        this.camera = $.Camera.createPerspective($.Game.window);

        // Rotate the camera and move it back a bit to get a good view.
        this.camera.transform.rotateY(180 * Math.PI / 180);
        this.camera.transform.localPosition.z = 14;

        this.spriteBatch = new $.SpriteBatch($.Game.graphics, this.camera);

        this.sky = new $.Sprite(this.spriteBatch, Content.Textures.sky);
        this.sky.pixelsPerUnit = 0.7;
        this.sky.origin = new $.Vector2(
            this.sky.width / 2, this.sky.height / 2);
        this.sky.transform.localScale.x = 5;
        this.sky.transform.localPosition.z = -5;

        this.clouds = new $.Sprite(this.spriteBatch, Content.Textures.clouds);
        this.clouds.pixelsPerUnit = 0.7;
        this.clouds.source.width *= 100;
        this.clouds.origin = new $.Vector2(
            this.clouds.width / 2, this.clouds.height / 2);
        this.clouds.transform.localPosition.z = -5;

        this.player = new Player(this);

        // Load the level from file and reload when the file changes.
        this.load("./content/level.json");
        let fw = new FileWatcher("./content/level.json", () => {
            this.load("./content/level.json");
        });

        // Disable culling to see the player walking in both directions.
        $.Game.graphics.rasterizerState = "cullNone";
    }

    load(filePath: string) {
        let data = JSON.parse(file.readText(filePath));

        this.platforms = [];
        this.coins = [];

        this.playerStart.xyz(
            data.player.position.x, data.player.position.y, 0);
        this.player.transform.localPosition = this.playerStart.copy();

        for (let p of data.platforms) {
            // Create platform and move to specified x, y.
            let platform = new Platform(
                this, p.size.x, p.size.y, p.name, p.drawOrder);
            platform.transform.move(
                new $.Vector3(p.position.x, p.position.y, 0));
            this.platforms.push(platform);
        }
        for (let c of data.coins) {
            // Create coin and move to specified x, y.
            let coin = new Coin(this, c.name);
            coin.transform.move(
                new $.Vector3(c.position.x, c.position.y, 0));
            this.coins.push(coin);
        }
    }

    draw() {
        this.sky.draw();
        this.clouds.draw();
        for (let p of this.platforms) {
            p.draw();
        }
        for (let c of this.coins) {
            c.draw();
        }
        this.player.draw();
        this.spriteBatch.draw();
    }

    update(elapsedTime: number) {
        this.player.update(elapsedTime);
        if (this.player.transform.localPosition.y < -10) {
            this.player.transform.localPosition = this.playerStart.copy();
            this.player.rigidBody.velocity.y = 0;
        }
        for (let p of this.platforms) {
            p.update(elapsedTime);
        }
        for (let c of this.coins) {
            c.update(elapsedTime);
        }
        this.detectCollisions();

        this.camera.transform.localPosition.x = 
            this.player.transform.localPosition.x;

        this.clouds.source.x += 0.005;
    }

    detectCollisions() {
        for (let c of this.coins) {
            if (this.player.collider.isColliding(c.collider)) {
                this.player.handleCollision(c, null);
            }
        }
        for (let p of this.platforms) {
            if (this.player.collider.isColliding(p.collider, Collision.mtv)) {
                this.player.handleCollision(p, Collision.mtv);
            }
        }
    }
}