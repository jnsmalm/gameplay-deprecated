var Game = require('../lib/game.js').Game;
var Entity = require('../lib/entity.js').Entity;
var Scene = require('../lib/scene.js').Scene;
var SpriteComponent = require('../lib/sprite.js').SpriteComponent;

// The game creates a window and enters a game loop which calls update and draw
// at specified intervals.
var game = new Game();
var scene = new Scene(game.window);

// Create the entity and add a sprite component for drawing a sprite.
var entity = new Entity();
entity.addComponent(new SpriteComponent({
    spriteBatch: scene.spriteBatch,
    texture: '/assets/cow.png',
    // Pixels per unit controls the size of the sprite.
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