var Entity = require('/entity.js').Entity;
var Utils = require('/utils.js').Utils;
var PerspectiveCamera = require('/camera.js').PerspectiveCamera;
var PhongMaterial = require('/material.js').PhongMaterial;
var SpriteComponent = require('/sprite.js').SpriteComponent;

function Scene(window) {
    Entity.call(this);
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
}

Utils.extend(Scene, Entity);

Scene.prototype.add = function (entity, layer) {
    layer = layer || 0;
    if (!this.layers[layer]) {
        this.layers[layer] = [];
    }
    this.layers[layer].push(entity);
    this.entities.push(entity);
};

Scene.prototype.update = function(elapsed) {
    for (var layer in this.layers) {
        for (var i=0; i<this.layers[layer].length; i++) {
            this.layers[layer][i].update(elapsed);
        }
    }
    this.camera.update(elapsed);
};

Scene.prototype.draw = function() {
    PhongMaterial.camera(this.camera);
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
