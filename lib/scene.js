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

var Collision = require('./collision.js').Collision;
var Camera = require('./camera.js').Camera;
var Model = require('./model.js').Model;
var Sprite = require('./sprite.js').Sprite;
var DirectionalLight = require('./light.js').DirectionalLight;
var Vector3 = require('./math.js').Vector3;

class Scene {
  constructor(window) {
    this.graphics = window.graphics;
    this.camera = new Camera({ window: window });
    this.lights = [
      new DirectionalLight(new Vector3(0,0,1))
    ];
    this.colliders = [];

    this.entities = [];
    this.entities.push = function() {
      // Override the default push method to be able to sort.
      var length = Array.prototype.push.apply(this, arguments);
      this.sort(sortByDrawOrder);
      return length;
    };

    Model.init(window);
    Model.camera = this.camera;
    Model.lights = this.lights;

    Sprite.init(window);
    Sprite.camera = this.camera;
  }

  update(elapsed) {
    var destroyed = [];
    for (var i=0; i<this.entities.length; i++) {
      this.entities[i].update(elapsed);
      if (this.entities[i].destroyed) {
        destroyed.push(i);
      }
    }
    for (var i=destroyed.length-1; i>=0; i--) {
      this.entities.splice(destroyed[i], 1);
    }
    Collision.detect(this.colliders);
  }

  draw() {
    if (this.entities.length === 0) {
      return;
    }
    Model.updateCameraAndLights();
    var drawOrder = this.entities[0].drawOrder;
    for (var i=0; i<this.entities.length; i++) {
      if (this.entities[i].drawOrder !== drawOrder) {
        // When an entity with another draworder is found, the batched sprites 
        // will be drawn. The depth buffer is also cleared so the entities with
        // a higher draworder is drawn on top.
        Sprite.drawBatched();
        this.graphics.clear('depth');
        drawOrder = this.entities[i].drawOrder;
      }
      this.entities[i].draw();
    }
    Sprite.drawBatched();
  }
}

function sortByDrawOrder(a, b) {
  if (a.drawOrder > b.drawOrder) {
    return 1;
  }
  if (a.drawOrder < b.drawOrder) {
    return -1;
  }
  return 0;
}

module.exports.Scene = Scene;