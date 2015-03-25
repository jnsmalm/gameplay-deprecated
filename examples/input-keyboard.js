var game = ko.import("../lib/game.js");
var keys = ko.import("../lib/keys.js");

game.init();

game.update = function () {
  var keyboard = game.window.keyboard;
  if (keyboard.isKeyDown(keys.escape)) {
    game.exit();
  }
};

game.run();