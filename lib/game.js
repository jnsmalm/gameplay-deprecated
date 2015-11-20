/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

var Color = require("/color.js").Color;
var Utils = require("/utils.js").Utils;

function Game(options) {

    options = Utils.options(options, this);
    options.value('targetElapsedTime', 1.0 / 60.0);
    options.value('isFixedTimeStep', true);
    options.value('backgroundColor', Color.cornflowerBlue());

    this.window = new Window(options);
    this.graphics = this.window.graphics;
    this.mouse = new Mouse(this.window);
    this.keyboard = new Keyboard(this.window);
    this.timer = new Timer();

    Object.defineProperty(Game, 'window', {
        value: this.window, writable: false
    });

    Object.defineProperty(Game, 'graphics', {
        value: this.graphics, writable: false
    });

    Object.defineProperty(Game, 'keyboard', {
        value: this.keyboard, writable: false
    });

    Object.defineProperty(Game, 'mouse', {
        value: this.mouse, writable: false
    });
}

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
                    // Lock updates exactly to the monitor refresh (in order to
                    // avoid endlessly accumulating small time deltas, which
                    // would eventually add up enough to cause a dropped frame).
                    accumulator = 0;
                }
                updated = true;
            }
        } else {
            this.update(frame);
            updated = true;
        }
        if (updated) {
            this.graphics.clear(this.backgroundColor);
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