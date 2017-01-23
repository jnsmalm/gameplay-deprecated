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
const animation_1 = require("./animation");
var Content;
(function (Content) {
    var Textures;
    (function (Textures) {
    })(Textures = Content.Textures || (Content.Textures = {}));
    var SpriteSheets;
    (function (SpriteSheets) {
    })(SpriteSheets = Content.SpriteSheets || (Content.SpriteSheets = {}));
    var SoundBuffers;
    (function (SoundBuffers) {
    })(SoundBuffers = Content.SoundBuffers || (Content.SoundBuffers = {}));
    function load() {
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
        SpriteSheets.walk = new animation_1.SpriteSheet(new Texture2D("./content/walk.png"));
        SpriteSheets.walk.texture.filter = "nearest";
        for (let i = 0; i < 4; i++) {
            SpriteSheets.walk.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            };
        }
        SpriteSheets.idle = new animation_1.SpriteSheet(new Texture2D("./content/idle.png"));
        for (let i = 0; i < 14; i++) {
            SpriteSheets.idle.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            };
        }
        SpriteSheets.idle.texture.filter = "nearest";
        SpriteSheets.jump = new animation_1.SpriteSheet(new Texture2D("./content/jump.png"));
        for (let i = 0; i < 11; i++) {
            SpriteSheets.jump.frames[i.toString()] = {
                frame: { x: i * 16, y: 0, w: 16, h: 16 }
            };
        }
        SpriteSheets.jump.texture.filter = "nearest";
        SoundBuffers.coin = new SoundBuffer("./content/coin.ogg");
        SoundBuffers.jump = new SoundBuffer("./content/jump.ogg");
    }
    Content.load = load;
})(Content = exports.Content || (exports.Content = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUVYLDJDQUEwRDtBQUUxRCxJQUFpQixPQUFPLENBdUV2QjtBQXZFRCxXQUFpQixPQUFPO0lBRXBCLElBQWlCLFFBQVEsQ0FPeEI7SUFQRCxXQUFpQixRQUFRO0lBT3pCLENBQUMsRUFQZ0IsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFPeEI7SUFFRCxJQUFpQixZQUFZLENBSTVCO0lBSkQsV0FBaUIsWUFBWTtJQUk3QixDQUFDLEVBSmdCLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBSTVCO0lBRUQsSUFBaUIsWUFBWSxDQUc1QjtJQUhELFdBQWlCLFlBQVk7SUFHN0IsQ0FBQyxFQUhnQixZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUc1QjtJQUVEO1FBQ0ksUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2xELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUVoQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDeEQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBRW5DLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxTQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFFckMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUVqQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksU0FB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