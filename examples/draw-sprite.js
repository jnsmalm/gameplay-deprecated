var game = ko.import("../lib/game.js");

game.init({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

var spriteBatch = new ko.SpriteBatch(game.window);

var texture = new ko.Texture("assets/cow.png");

var sprite = {
  texture: texture,
  position: {
    x: game.screenCenter.x,
    y: game.screenCenter.y,
  },
  origin: {
    x: texture.width / 2,
    y: texture.height / 2,
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
  },
  source: {
    x: 0,
    y: 0,
    width: texture.width,
    height: texture.height,
  },
  rotation: 0,
};

game.draw = function () {
  spriteBatch.begin();
  spriteBatch.draw(sprite);
  spriteBatch.end();
};

game.run();