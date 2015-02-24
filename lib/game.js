var Game = function () {
  this.targetElapsedTime = 1.0 / 60.0;
  this.isFixedTimeStep = true;
};

Game.prototype.init = function (options) {
  this.window = new cowy.Window(options);
  this.screenCenter = {
    x: this.window.width / 2,
    y: this.window.height / 2,
  };
};

Game.prototype.run = function () {
  lastTime = this.window.getTime();
  while (!this.window.isClosing()) {
    timeStep(this);
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

var lastTime = 0;
var timeAccumulator = 0;

var timeStep = function (game) {
  var currentTime = game.window.getTime();
  var frameTime = currentTime - lastTime;
  lastTime = currentTime;
  var updated = false;
  if (game.isFixedTimeStep) {
    updated = fixedTimeStep(game, frameTime);
  } else {
    updated = variableTimeStep(game, frameTime);
  }
  if (updated) {
    game.window.clear();
    game.draw();
    game.window.swapBuffers();
  }
};

var fixedTimeStep = function (game, frameTime) {
  timeAccumulator += frameTime;
  var updated = false;
  while (timeAccumulator >= game.targetElapsedTime) {
    game.update(game.targetElapsedTime);
    timeAccumulator -= game.targetElapsedTime;
    updated = true;
  }
  return updated;
};

var variableTimeStep = function (game, frameTime) {
  game.update(frameTime);
  return true;
};

exports = new Game();