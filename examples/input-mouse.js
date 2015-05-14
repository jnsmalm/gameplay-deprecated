var Game = require("../lib/game.js").Game;

var game = new Game({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

game.update = function (elapsed) {
  var mouse = game.window.mouse;
  game.window.setTitle("x: " + mouse.x + ", y: " + mouse.y);
  if (mouse.isButtonDown(0)) {
    game.window.setTitle("0");
  }
  if (mouse.isButtonDown(1)) {
    game.window.setTitle("1");
  }
};

game.run();