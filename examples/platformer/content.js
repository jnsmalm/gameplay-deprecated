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

'use strict';

var $ = require('/../../lib/import.js').library();

class Content {
  load() {
    this.buffers = {
      bounce: new SoundBuffer('/content/sounds/bounce.wav'),
      coin: new SoundBuffer('/content/sounds/coin.wav')
    };
    this.textures = {
      dirt: new Texture2D('/content/graphics/dirt.png'),
      grass: new Texture2D('/content/graphics/grass.png'),
      jump: new Texture2D('/content/graphics/jump.png'),
      idle: new Texture2D('/content/graphics/idle.png'),
      walk: new Texture2D('/content/graphics/walk.png'),
      coin: new Texture2D('/content/graphics/coin.png'),
      platform: new Texture2D('/content/graphics/platform.png'),
      sky: new Texture2D('/content/graphics/sky.png'),
      clouds: new Texture2D('/content/graphics/clouds.png')
    };
    this.sheets = {
      idle: new $.SpriteSheet({ 
        texture: this.textures.idle,
        width: 16,
        height: 16
      }),
      jump: new $.SpriteSheet({ 
        texture: this.textures.jump,
        width: 16,
        height: 16
      }),
      walk: new $.SpriteSheet({ 
        texture: this.textures.walk,
        width: 16,
        height: 16
      })
    };
  }
}

module.exports.Content = new Content();