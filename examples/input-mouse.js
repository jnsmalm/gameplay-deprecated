var game = ko.import("../lib/game.js");

game.init();
var window = game.window;

game.update = function () {
  window.setTitle("x: " + window.mouse.x + ", y: " + window.mouse.y);
  if (window.mouse.isButtonDown(0)) {
    window.setTitle("0");
  }
  if (window.mouse.isButtonDown(1)) {
    window.setTitle("1");
  }
};

game.run();