// Import everything in the library into the '$' variable.
var $ = require('/../lib/import.js').library();

var game = new $.Game();

// The SpriteBatch is used for drawing many sprites in the same draw call to
// improve performance.
var spriteBatch = new $.SpriteBatch(game.window);
var sprite = new $.Sprite(spriteBatch, '/assets/cow.png');

game.draw = function() {
  // Add to list of sprites to be drawn.
  spriteBatch.addSprite(sprite);
  // Draw as many sprites as possible in a single draw call.
  spriteBatch.drawSprites();
};

// Start running the game which calls update and draw.
game.run();