var game = ko.include("../lib/game.js");

game.init({
  width: 1024,
  height: 576,
  fullscreen: false, 
});

var chars = "Let's build desktop games with JavaScript!";

var spriteBatch = new ko.SpriteBatch(game.window);

var font = new ko.SpriteFont({
  filename:"assets/andyb.ttf",
  size: 50,
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