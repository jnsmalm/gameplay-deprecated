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
"use strict";
const color_1 = require("./color");
const sprite_1 = require("./sprite");
const camera_1 = require("./camera");
const hotswap_1 = require("./hotswap");
/** Handles the window, input devices and sets up the game loop. */
var Game;
(function (Game) {
    /** Color used when clearing the graphics each frame. */
    Game.clearColor = new color_1.Color(0.3, 0.3, 0.3, 1);
    /** Creates the window/graphics and input devices. */
    function init(options = {}) {
        if (Game.window) {
            // Make sure the game does not get initialized more than once.
            return;
        }
        let { height = options.fullscreen ? 0 : 576, fullscreen = false, enableEscapeKeyAsExit = true, enableFileWatcher = true, width = options.fullscreen ? 0 : 1024, targetElapsedTime = 1 / 60, title = "" } = options;
        Game.window = new Window({
            height: height,
            fullscreen: fullscreen,
            width: width,
            title: title
        });
        Game.keyboard = new Keyboard(Game.window);
        Game.mouse = new Mouse(Game.window);
        Game.graphics = Game.window.graphics;
        if (enableFileWatcher) {
            FileWatcher.start();
        }
        timeStep = new FixedTimeStep(targetElapsedTime);
        timeStep.draw = () => {
            Game.graphics.clear("default", Game.clearColor);
            ErrorHandler.tryDraw();
            Game.graphics.present();
        };
        timeStep.update = (elapsedTime) => {
            Game.keyboard.updateState();
            if (enableEscapeKeyAsExit && Game.keyboard.isKeyDown(256)) {
                Game.exit();
                return;
            }
            if (enableFileWatcher) {
                FileWatcher.handleEvents();
            }
            Game.mouse.updateState();
            ErrorHandler.tryUpdate(elapsedTime);
        };
    }
    Game.init = init;
    /** Run the game, will not return until exit is called. */
    function run() {
        let timer = new Timer();
        let lastTime = 0;
        // To make sure the run method does not get called again. E.g when
        // using hotswap functionality.
        Game.run = () => { };
        while (!Game.window.isClosing()) {
            Game.window.pollEvents();
            let time = timer.elapsed();
            timeStep.step(time - lastTime);
            lastTime = time;
        }
    }
    Game.run = run;
    function draw() {
        // Implemented by the user.
    }
    Game.draw = draw;
    function update(elapsedTime) {
        // Implemented by the user.
    }
    Game.update = update;
    /** Exits the game and closes the window. */
    function exit() {
        Game.window.close();
    }
    Game.exit = exit;
})(Game = exports.Game || (exports.Game = {}));
let timeStep;
class FixedTimeStep {
    constructor(targetElapsedTime) {
        this.targetElapsedTime = targetElapsedTime;
        this.accumulator = 0;
    }
    step(elapsedTime) {
        this.accumulator += elapsedTime;
        let updated = false;
        while (this.accumulator >= this.targetElapsedTime) {
            this.update(this.targetElapsedTime);
            updated = true;
            this.accumulator -= this.targetElapsedTime;
            if (this.accumulator <= this.targetElapsedTime / 2) {
                // Lock updates exactly to the monitor refresh (in order to
                // avoid endlessly accumulating small time deltas, which would 
                // eventually add up enough to cause a dropped frame).
                this.accumulator = 0;
            }
        }
        if (updated) {
            this.draw();
        }
    }
    draw() {
    }
    update(elapsedTime) {
    }
}
var ErrorHandler;
(function (ErrorHandler) {
    hotswap_1.HotSwap.done((filepath) => {
        // Reset error when a module has been updated.
        errors = false;
    });
    hotswap_1.HotSwap.fail((filepath) => {
        // Something went wrong when swapping
        errors = true;
    });
    let errors = false;
    let sbatch;
    let sprite;
    function tryDraw() {
        if (!sbatch) {
            sbatch = new sprite_1.SpriteBatch(Game.graphics, camera_1.Camera.createDefault(Game.window, true));
            sprite = sprite_1.Sprite.createFromFile(module.path + "/content/error.png", sbatch);
        }
        if (errors) {
            sprite.draw();
            sbatch.draw();
            return;
        }
        try {
            Game.draw();
        }
        catch (err) {
            console.log(err.stack);
            errors = true;
        }
    }
    ErrorHandler.tryDraw = tryDraw;
    function tryUpdate(elapsedTime) {
        if (errors) {
            return;
        }
        try {
            Game.update(elapsedTime);
        }
        catch (err) {
            console.log(err.stack);
            errors = true;
        }
    }
    ErrorHandler.tryUpdate = tryUpdate;
})(ErrorHandler || (ErrorHandler = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUdYLG1DQUErQjtBQUMvQixxQ0FBOEM7QUFDOUMscUNBQWlDO0FBQ2pDLHVDQUFtQztBQVluQyxtRUFBbUU7QUFDbkUsSUFBYyxJQUFJLENBd0ZqQjtBQXhGRCxXQUFjLElBQUk7SUFFZCx3REFBd0Q7SUFDN0MsZUFBVSxHQUFHLElBQUksYUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBT3BELHFEQUFxRDtJQUNyRCxjQUFxQixVQUF1QixFQUFFO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLEtBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULDhEQUE4RDtZQUM5RCxNQUFNLENBQUM7UUFDWCxDQUFDO1FBQ0QsSUFBSSxFQUNBLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQ3JDLFVBQVUsR0FBRyxLQUFLLEVBQ2xCLHFCQUFxQixHQUFHLElBQUksRUFDNUIsaUJBQWlCLEdBQUcsSUFBSSxFQUN4QixLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUNyQyxpQkFBaUIsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUMxQixLQUFLLEdBQUcsRUFBRSxFQUNiLEdBQUcsT0FBTyxDQUFDO1FBRVosS0FBQSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUM7WUFDaEIsTUFBTSxFQUFFLE1BQU07WUFDZCxVQUFVLEVBQUUsVUFBVTtZQUN0QixLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO1FBQ0gsS0FBQSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBQSxNQUFNLENBQUMsQ0FBQztRQUNoQyxLQUFBLEtBQUssR0FBRyxJQUFJLEtB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