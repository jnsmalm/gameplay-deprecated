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
var SpriteComponent = require('/sprite.js').SpriteComponent;
var DirectionalLight = require('/light.js').DirectionalLight;
var Material = require('/material.js').Material;

function Scene(window) {
    Entity.call(this);
    this.lights = [];
    this.entities = [];
    this.camera = new PerspectiveCamera({
        aspectRatio: window.width/window.height,
        near: 1,
        far: 1000,
        fieldOfView: 45
    });
    this.window = window;
    this.graphics = window.graphics;
    this.layers = {};
    this.directionalLight = new DirectionalLight(new Vector3(0,0,1));
    this.addLight(this.directionalLight);
}

Utils.extend(Scene, Entity);

Scene.prototype.addEntity = function (entity, layer) {
    layer = layer || 0;
    if (!this.layers[layer]) {
        this.layers[layer] = [];
    }
    this.layers[layer].push(entity);
    this.entities.push(entity);
};

Scene.prototype.addLight = function (light) {
    this.lights.push(light);
};

Scene.prototype.update = function(elapsed) {
    for (var layer in this.layers) {
        for (var i=0; i<this.layers[layer].length; i++) {
            this.layers[layer][i].update(elapsed);
        }
    }
    for (var i=0; i<this.lights.length; i++) {
        this.lights[i].update(elapsed);
    }
    this.camera.update(elapsed);
};

Scene.prototype.draw = function() {
    // Setup all used materials with camera and lights for the current frame.
    Material.setup(this.camera, this.lights);
    for (var layer in this.layers) {
        for (var i=0; i<this.layers[layer].length; i++) {
            this.layers[layer][i].draw();
        }
        // When sprite components are drawn, the sprites are really just being
        // added to a list. The function below will actually draw the sprites.
        SpriteComponent.draw();
        // When sprites are drawn the depth state is automatically changed,
        // let's reset it here to prepare for the next frame.
        this.graphics.setDepthState('default');
    }
};

module.exports.Scene = Scene;
