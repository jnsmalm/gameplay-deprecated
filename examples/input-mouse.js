var game = ko.import("../lib/game.js");

game.init();

game.update = function () {
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