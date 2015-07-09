var Color = require("color.js").Color;

function Game(options) {
    options = options || {};
    this.window = new Window(options);
    this.screenCenter = {
        x: this.window.width / 2,
        y: this.window.height / 2,
    };
    if (options.isFixedTimeStep === false) {
        this.isFixedTimeStep = false;
    } else {
        this.isFixedTimeStep = true;
    }
    this.targetElapsedTime = options.targetElapsedTime || 1.0 / 60.0;
    this.clearColor = options.clearColor || Color.cornflowerBlue();
    this.graphics = this.window.graphics;
    this.mouse = new Mouse(this.window);
    this.keyboard = new Keyboard(this.window);
    this.timer = new Timer();
};

Game.prototype.run = function () {
  var last = 0;
  var accumulator = 0;
  while (!this.window.isClosing()) {
    this.window.pollEvents();
    this.keyboard.updateState();
    this.mouse.updateState();
    var current = this.timer.elapsed();
    var frame = current - last;
    var updated = false;
    last = current;
    if (this.isFixedTimeStep) {
      accumulator += frame;
      while (accumulator >= this.targetElapsedTime) {
        this.update(this.targetElapsedTime);
        accumulator -= this.targetElapsedTime;
        if (accumulator <= this.targetElapsedTime / 2) {
          // Lock updates exactly to the monitor refresh (in order to avoid 
          // endlessly accumulating small time deltas, which would eventually 
          // add up enough to cause a dropped frame).
          accumulator = 0;
        }
        updated = true;
      }
    } else {
      this.update(frame);
      updated = true;
    }
    if (updated) {
      this.graphics.clear(this.clearColor);
      this.draw();
      this.graphics.present();
    }
  }
};

Game.prototype.update = function () {
};

Game.prototype.draw = function () {
};

Game.prototype.exit = function () {
    this.window.close();
};

module.exports.Game = Game;