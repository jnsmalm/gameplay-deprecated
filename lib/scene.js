/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

var Entity = require('/entity.js').Entity;
var Utils = require('/utils.js').Utils;
var PerspectiveCamera = require('/camera.js').PerspectiveCamera;
var SpriteBatch = require('/sprite.js').SpriteBatch;
var DirectionalLight = require('/light.js').DirectionalLight;
var Material = require('/material.js').Material;

function Scene(window) {
    this.window = window;
    this.graphics = window.graphics;
    this.lights = [];
    this.entities = [];
    this.camera = new PerspectiveCamera({
        window: window,
        near: 1,
        far: 1000,
        fieldOfView: 45
    });
    this.spriteBatch = new SpriteBatch(window);
    this.directionalLight = new DirectionalLight(new Vector3(0,0,1));
    this.lights.push(this.directionalLight);
}

Scene.prototype.addEntity = function(entity) {
    this.entities.push(entity);
    this.entities.sort(function(a, b) {
        if (a.drawOrder > b.drawOrder) {
            return 1;
        }
        if (a.drawOrder < b.drawOrder) {
            return -1;
        }
        return 0;
    });
};

Scene.prototype.addLight = function(light) {
    this.lights.push(light);
};

Scene.prototype.update = function(elapsed) {
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
    for (var i=0; i<this.lights.length; i++) {
        this.lights[i].update(elapsed);
    }
    this.camera.update(elapsed);
};

Scene.prototype.draw = function() {
    if (this.entities.length == 0) {
        return;
    }
    Material.setup(this.camera, this.lights);
    this.spriteBatch.viewProjection = this.camera.viewProjection;
    var drawOrder = this.entities[0].drawOrder;
    for (var i=0; i<this.entities.length; i++) {
        if (this.entities[i].drawOrder !== drawOrder) {
            this.spriteBatch.flush();
            this.graphics.clear('depth');
            drawOrder = this.entities[i].drawOrder;
        }
        this.entities[i].draw();
    }
    this.spriteBatch.flush();
};

module.exports.Scene = Scene;
