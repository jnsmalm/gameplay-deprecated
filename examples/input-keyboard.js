var Game = require("../lib/game.js").Game;
var keys = require("../lib/keys.js");

var game = new Game({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

game.update = function (elapsed) {
  var keyboard = game.window.keyboard;
  if (keyboard.isKeyDown(keys.ESCAPE)) {
    game.exit();
  }
};

game.run();