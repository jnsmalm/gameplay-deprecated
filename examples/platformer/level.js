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

var $ = require('/../../lib/import.js').library().include(
  '/platform.js', 
  '/player.js',
  '/ground.js', 
  '/content.js',
  '/coin.js'
);

$.Physics.gravity.y = -55;

class Level extends $.Scene {
  constructor(filepath) {
    super($.Game.window);

    // Create a file watcher so the level can be edited in runtime.
    var watcher = new FileWatcher(filepath, (function() {
      this.load(filepath);
    }).bind(this));

    // Create the sky sprite and move it back to get a parallax effect.
    this.sky = new $.Sprite($.Content.textures.sky);
    this.sky.pixelsPerUnit = 0.5;
    this.sky.source.w = this.sky.texture.width * 100;
    this.sky.transform.move(0,5,-10);

    // Create the clouds sprite and move it back to get a parallax effect.
    this.clouds = new $.Sprite($.Content.textures.clouds);
    this.clouds.pixelsPerUnit = 0.5;
    this.clouds.source.w = this.clouds.texture.width * 100;
    this.clouds.source.h = this.clouds.texture.height * 100;
    this.clouds.transform.move(0,5,-10);

    // Move the camera back.
    this.camera.transform.move(0, 0, 10);

    this.load(filepath);
  }

  update(elapsed) {
    super.update(elapsed);

    // Make the camera follow the player on the x axis.
    this.camera.transform.position = 
      new $.Vector3(this.player.transform.position.x, 0, 
        this.camera.transform.position.z);

    // Animate the clouds.
    this.clouds.source.x += 0.01;
  }

  draw() {
    this.sky.draw();
    this.clouds.draw();
    super.draw();
  }

  load(filepath) {
    var data = JSON.parse(file.readText(filepath));

    // Remove all the entities and colliders by setting length to zero.
    this.colliders.length = 0;
    this.entities.length = 0;

    if (data.player) {
      // Adds a player to the level.
      this.player = new $.Player(this.colliders);
      this.player.transform.position = 
        new $.Vector3(data.player.position.x, data.player.position.y, 0);
      this.entities.push(this.player);
    }

    for (var i=0; i<data.grounds.length; i++) {
      // Add all the ground in the level.
      var ground = new $.Ground(this.colliders, data.grounds[i]);
      this.entities.push(ground);
    }

    for (var i=0; i<data.platforms.length; i++) {
      // Add all the platforms in the level.
      var platform = new $.Platform(this.colliders, data.platforms[i]);
      this.entities.push(platform);
    }

    for (var i=0; i<data.coins.length; i++) {
      // Add all the coins in the level.
      var coin = new $.Coin(this.colliders, data.coins[i]);
      this.entities.push(coin);
    }
  }
}

module.exports.Level = Level;