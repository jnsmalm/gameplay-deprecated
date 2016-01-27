// Import everything in the library into the '$' variable.
var $ = require('/../lib/import.js');

var game = new $.Game();

$.Sprite.init(game.window);
var sprite = new $.Sprite('/assets/cow.png');

game.draw = function() {
  sprite.draw();
  // To improve performance when drawing many sprites, the sprites are batched 
  // by texture. Make sure that the last drawn sprites are being drawn.
  $.Sprite.drawBatched();
};

// Start running the game which calls update and draw.
game.run();