var Game = require("../lib/game.js").Game;
var Sprite = require("../lib/sprite.js").Sprite;

var game = new Game({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

var spriteBatch = new SpriteBatch(game.window);

var sprite = new Sprite(spriteBatch, "assets/cow.png");
sprite.position.x = game.screenCenter.x;
sprite.position.y = game.screenCenter.y;
sprite.center();

game.draw = function () {
  spriteBatch.begin();
  sprite.draw();
  spriteBatch.end();
};

game.run();