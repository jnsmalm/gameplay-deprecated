var Entity = require('/entity.js').Entity;
var Utils = require('/utils.js').Utils;
var PerspectiveCamera = require('/camera.js').PerspectiveCamera;
var PhongMaterial = require('/material.js').PhongMaterial;

function Scene(window) {
    Entity.call(this);
    this.entities = [];
    this.camera = new PerspectiveCamera(window.width/window.height);
    this.window = window;
    this.graphics = window.graphics;
}

Utils.extend(Scene, Entity);

Scene.prototype.add = function (entity) {
    this.entities.push(entity);
};

Scene.prototype.update = function(elapsed) {
    Entity.prototype.update.call(this, elapsed);
    for (var i=0; i<this.entities.length; i++) {
        this.entities[i].update(elapsed);
    }
    this.camera.update(elapsed);
};

Scene.prototype.draw = function() {
    PhongMaterial.camera(this.camera);
    Entity.prototype.draw.call(this);
    for (var i=0; i<this.entities.length; i++) {
        this.entities[i].draw();
    }
};

module.exports.Scene = Scene;
