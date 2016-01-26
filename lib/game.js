/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

'use strict';

var Color = require("/color.js").Color;
var Utils = require("/utils.js").Utils;

var _currentGame;
var _timeAccumulator = 0;
var _lastTime = 0;
var _elapsedTime = 0;
var _framesPerSecond = 0;
var _frameCounter = 0;

class Game {
  constructor(options) {
    if (_currentGame) {
      throw new TypeError('Can only have a single game instance.');
    }
    _currentGame = this;

    options = Utils.options(options, this);
    options.value('targetElapsedTime', 1.0 / 60.0);
    options.value('isFixedTimeStep', true);
    options.value('clearColor', Color.cornflowerBlue());

    this.window = new Window(options);
    this.graphics = this.window.graphics;
    this.mouse = new Mouse(this.window);
    this.keyboard = new Keyboard(this.window);
    this.timer = new Timer();
  }

  get fps() {
    return _framesPerSecond;
  }

  update() {
    // Game logic goes here.
  }

  draw() {
    // Render graphics here.
  }

  exit() {
    this.window.close();
  }

  run() {
    while (!this.window.isClosing()) {
      step();
    }
  }

  static get graphics() {
    return _currentGame.graphics;
  }

  static get window() {
    return _currentGame.window;
  }

  static get keyboard() {
    return _currentGame.keyboard;
  }

  static get mouse() {
    return _currentGame.mouse;
  }
}

function step() {
  _currentGame.window.pollEvents();
  _currentGame.keyboard.updateState();
  _currentGame.mouse.updateState();

  var currentTime = _currentGame.timer.elapsed();
  var frameTime = currentTime - _lastTime;
  _lastTime = currentTime;

  if ((_elapsedTime += frameTime) >= 1) {
    _elapsedTime -= 1;
    _framesPerSecond = _frameCounter;
    _frameCounter = 0;
  }
  if (_currentGame.isFixedTimeStep) {
    if (fixedStep(frameTime)) {
      clearDrawAndPresent(frameTime);
    }
  } else {
    _currentGame.update(frameTime);
    clearDrawAndPresent(frameTime);
  }
}

function fixedStep(frameTime) {
  var updated = false;
  _timeAccumulator += frameTime;
  while (_timeAccumulator >= _currentGame.targetElapsedTime) {
    _currentGame.update(_currentGame.targetElapsedTime);
    _timeAccumulator -= _currentGame.targetElapsedTime;
    if (_timeAccumulator <= _currentGame.targetElapsedTime / 2) {
      // Lock updates exactly to the monitor refresh (in order to
      // avoid endlessly accumulating small time deltas, which
      // would eventually add up enough to cause a dropped frame).
      _timeAccumulator = 0;
    }
    updated = true;
  }
  return updated;
}

function clearDrawAndPresent() {
  _currentGame.graphics.clear('default', _currentGame.clearColor);
  _currentGame.draw();
  _currentGame.graphics.present();
  _frameCounter++;
}

module.exports.Game = Game;