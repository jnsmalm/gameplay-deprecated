var Game = require("../lib/game.js").Game;

var game = new Game({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

var spriteBatch = new SpriteBatch(game.window);

var chars = "kobingo.js";

var font = new SpriteFont({
  filename: "assets/sunshine.ttf",
  size: 120,
  chars: chars
});

var title = {
  text: chars,
  font: font,
  position: {
    x: game.screenCenter.x,
    y: game.screenCenter.y,
  },
  origin: {
    x: font.measureString(chars) / 2,
  },
  scaling: {
    x: 1,
    y: 1,
  },
  color: {
    r: 1,
    g: 1,
    b: 1,
    a: 1,
  }
};

game.draw = function () {
  spriteBatch.begin();
  spriteBatch.drawString(title);
  spriteBatch.end();
};

game.run();