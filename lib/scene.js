var Entity = require('/entity.js').Entity;
var Utils = require('/utils.js').Utils;
var PerspectiveCamera = require('/camera.js').PerspectiveCamera;
var PhongMaterial = require('/material.js').PhongMaterial;

function Scene(window) {
    Entity.call(this);
    this.camera = new PerspectiveCamera(window.width/window.height);
    this.window = window;
    this.graphics = window.graphics;
}

Utils.extend(Scene, Entity);

Scene.prototype.update = function(elapsed) {
    Entity.prototype.update.call(this, elapsed);
    this.camera.update(elapsed);
};

Scene.prototype.draw = function() {
    PhongMaterial.camera(this.camera);
    Entity.prototype.draw.call(this);
};

module.exports.Scene = Scene;
