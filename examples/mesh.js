var Game = require('../lib/game.js').Game;
var Entity = require('../lib/entity.js').Entity;
var Scene = require('../lib/scene.js').Scene;
var MeshComponent = require('../lib/mesh.js').MeshComponent;
var Mesh = require('../lib/mesh.js').Mesh;
var PhongMaterial = require('../lib/material.js').PhongMaterial;

// The game creates a window and enters a game loop which calls update and draw
// at specified intervals.
var game = new Game();
var scene = new Scene(game.window);

// A material is an abstraction for drawing with shaders.
var phong = new PhongMaterial(game.graphics);

// Create the entity and add a mesh component for drawing a 3D model.
var entity = new Entity();
entity.addComponent(new MeshComponent(
    Mesh.load('/assets/suzanne.obj', game.graphics, phong)));

scene.addEntity(entity);

game.update = function (elapsed) {
    scene.update(elapsed);
    // Rotate the entity around the y axis.
    entity.transform.rotate(0,0.015,0);
};

game.draw = function () {
    scene.draw();
};

game.run();