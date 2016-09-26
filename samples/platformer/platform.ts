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

export class Platform extends $.Entity {
    rigidBody: $.RigidBody;
    collider: $.BoxCollider;

    constructor(level: Level, width: number, height: number, name: string,
        drawOrder: number) {

        super();

        // Add rigid body to handle collision with player.
        this.rigidBody = this.addComponent(new $.RigidBody(0, 0, 0));

        if (width == 1 && height == 1) {
            // Create a single platform with a single sprite.
            let platform = this.addComponent(
                new $.Sprite(level.spriteBatch, Content.Textures.platform));
            platform.pixelsPerUnit = 8;
            platform.origin = new $.Vector2(
                platform.width / 2, platform.height / 2);
            platform.drawOrder = drawOrder;

            this.collider = this.addComponent(new $.BoxCollider(
                new $.Vector3(platform.width / 2, platform.height / 2, 1)));
        } else {
            // Create a platform with the specified width and height. It has
            // two sprites, one for the dirt and one for the grass.
            let dirt = this.addComponent(
                new $.Sprite(level.spriteBatch, Content.Textures.dirt));
            dirt.pixelsPerUnit = 8;
            dirt.source.width = dirt.pixelsPerUnit * width;
            dirt.source.height = dirt.pixelsPerUnit * height;
            dirt.origin = new $.Vector2(dirt.width / 2, dirt.height / 2);
            dirt.drawOrder = drawOrder;

            let grass = this.addComponent(
                new $.Sprite(level.spriteBatch, Content.Textures.grass));
            grass.pixelsPerUnit = 8;
            grass.source.width = grass.pixelsPerUnit * width;
            grass.origin = new $.Vector2(grass.width / 2, dirt.height / 2);
            grass.drawOrder = drawOrder;

            this.collider = this.addComponent(new $.BoxCollider(
                new $.Vector3(dirt.width / 2, dirt.height / 2, 1)));
        }
    }
}