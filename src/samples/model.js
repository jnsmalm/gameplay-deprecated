// Import everything in the library into the '$' variable.
var $ = require('/../lib/import.js').library();

var game = new $.Game();

// Create a shader which is used when drawing the model.
var shader = new $.BasicShader(game.window);

var model = $.Model.load('./assets/suzanne.json', shader);
model.transform.scale(0.5, 0.5, 0.5);

game.update = function() {
  model.transform.rotate(0, 0.01, 0);
  // Update camera and lights.
  shader.update();
};

game.draw = function() {
  model.draw();
};

// Start running the game which calls update and draw.
game.run();