var Game = require('../lib/game.js').Game;
var Entity = require('../lib/entity.js').Entity;
var Scene = require('../lib/scene.js').Scene;
var SpriteComponent = require('../lib/sprite.js').SpriteComponent;

var game = new Game();
var scene = new Scene(game.window);

var entity = new Entity();
entity.addComponent(new SpriteComponent({
    spriteBatch: scene.spriteBatch,
    texture: '/assets/cow.png',
    pixelsPerUnit: 200
}));

scene.addEntity(entity);

game.update = function (elapsed) {
    scene.update(elapsed);
};

game.draw = function () {
    scene.draw();
};

game.run();