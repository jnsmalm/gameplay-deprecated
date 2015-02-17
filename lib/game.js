var cowylib = (function (cowylib) {

  var lastTime = 0, timeAccumulator = 0;

  var fixedTimeStep = function (game) {
    var currentTime = game.window.getTime();
    var frameTime = currentTime - lastTime;
    lastTime = currentTime;
    if (frameTime > 0.2) {
      frameTime = 0.2;
    }
    timeAccumulator += frameTime;
    var hasUpdated = false;
    while (timeAccumulator >= game.targetElapsedTime) {
      game.update(game.targetElapsedTime);
      timeAccumulator -= game.targetElapsedTime;
      hasUpdated = true;
    }
    if (hasUpdated) {
      clearDrawAndSwapBuffers(game);
    }
  };

  var variableTimeStep = function (game) {
    var currentTime = game.window.getTime();
    var frameTime = currentTime - lastTime;
    lastTime = currentTime;
    game.update(frameTime);
    clearDrawAndSwapBuffers(game);
  };

  var clearDrawAndSwapBuffers = function (game) {
    game.window.clear();
    game.draw();
    game.window.swapBuffers();
  };

  var Game = function () {
    this.targetElapsedTime = 1.0 / 60.0;
    this.isFixedTimeStep = true;
  };

  Game.prototype.init = function (options) {
    this.window = new cowy.Window(options);
  };

  Game.prototype.run = function () {
    lastTime = this.window.getTime();
    while (!this.window.isClosing()) {
      if (this.isFixedTimeStep) {
        fixedTimeStep(this);
      } else {
        variableTimeStep(this);
      }
      this.window.pollEvents();
    }
  };

  Game.prototype.exit = function () {
    this.window.close();
  };

  Game.prototype.update = function () {
  };

  Game.prototype.draw = function () {
  };

  cowylib.game = new Game();

  return cowylib;

})(cowylib || {});