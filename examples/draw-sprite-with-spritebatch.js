var Game = require('/../lib/game.js').Game;
var SpriteBatch = require('/../lib/sprite.js').SpriteBatch;

var game = new Game({
  width: 1024,
  height: 576,
  fullscreen: false
});

// Create sprite batch with the window for the game.
var spriteBatch = new SpriteBatch(game.window);

// Create texture with the image path.
var texture = new Texture2D('/assets/cow.png');

var sprite = {
  // Texture to use when drawing.
  texture: texture,
  // Source rectangle on the texture.
  source: { x: 0, y: 0, w: texture.width, h: texture.height },
  // Position for the sprite.
  position: { x: 516, y: 288 },
  // Scaling for the sprite.
  scaling: { x: 1, y: 1 },
  // Rotation (in radians) for the sprite.
  rotation: 0,
  // Origin for the sprite.
  origin: { x: texture.width / 2, y: texture.height / 2 },
  // Color for the sprite.
  color: { r: 1, g: 1, b: 1, a: 1 }
};

game.draw = function () {
  spriteBatch.begin();
  spriteBatch.draw(sprite);
  spriteBatch.end();
};

game.run();