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

import { Vector3 } from "./math"
import { Color } from "./color"
import { Sprite, SpriteBatch } from "./sprite"
import { Camera } from "./camera"
import { HotSwap } from "./hotswap"

export interface GameOptions {
    enableFileWatcher?: boolean;
    height?: number;
    fullscreen?: boolean;
    width?: number;
    enableEscapeKeyAsExit?: boolean;
    targetElapsedTime?: number;
}

/** Handles the window, input devices and sets up the game loop. */
export module Game {

    /** Color used when clearing the graphics each frame. */
    export let clearColor = new Color(0.3, 0.3, 0.3, 1);

    export let graphics: Graphics;
    export let keyboard: Keyboard;
    export let mouse: Mouse;
    export let window: Window;

    /** Creates the window/graphics and input devices. */
    export function init(options: GameOptions = {}) {
        if (window) {
            // Make sure the game does not get initialized more than once.
            return;
        }
        let {
            height = 576,
            fullscreen = false,
            enableEscapeKeyAsExit = true,
            enableFileWatcher = true,
            width = 1024,
            targetElapsedTime = 1 / 60
        } = options;

        window = new Window({
            height: height,
            fullscreen: fullscreen,
            width: width
        });
        keyboard = new Keyboard(window);
        mouse = new Mouse(window);
        graphics = window.graphics;

        if (enableFileWatcher) {
            FileWatcher.start();
        }
        timeStep = new FixedTimeStep(targetElapsedTime);
        timeStep.draw = () => {
            graphics.clear("default", clearColor);
            ErrorHandler.tryDraw();
            graphics.present();
        };
        timeStep.update = (elapsedTime: number) => {
            keyboard.updateState();
            if (enableEscapeKeyAsExit && keyboard.isKeyDown(256)) {
                Game.exit();
                return;
            }
            if (enableFileWatcher) {
                FileWatcher.handleEvents();
            }
            mouse.updateState();
            ErrorHandler.tryUpdate(elapsedTime);
        };
    }

    /** Run the game, will not return until exit is called. */
    export function run() {
        let timer = new Timer();
        let lastTime = 0;

        // To make sure the run method does not get called again. E.g when
        // using hotswap functionality.
        Game.run = () => { };

        while (!window.isClosing()) {
            window.pollEvents();
            let time = timer.elapsed();
            timeStep.step(time - lastTime)
            lastTime = time;
        }
    }

    export function draw() {
        // Implemented by the user.
    }

    export function update(elapsedTime: number) {
        // Implemented by the user.
    }

    /** Exits the game and closes the window. */
    export function exit() {
        window.close();
    }
}

interface TimeStep {
    update(elapsedTime: number): void;
    draw(): void;
    step(elapsedTime: number): void;
}

let timeStep: TimeStep;

class FixedTimeStep implements TimeStep {
    accumulator = 0;

    constructor(public targetElapsedTime: number) {
    }
    step(elapsedTime: number) {
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
    update(elapsedTime: number) {
    }
}

namespace ErrorHandler {
    HotSwap.changed((filepath: string) => {
        // Reset error when a module has been updated.
        error = false;
    });
    let error = false;
    let sbatch: SpriteBatch;
    let sprite: Sprite;

    export function tryDraw() {
        if (!sbatch) {
            sbatch = new SpriteBatch(
                Game.graphics, Camera.createDefault(Game.window, true));
            sprite = Sprite.createFromFile(
                module.path + "/content/error.png", sbatch);
        }
        if (error) {
            sprite.draw();
            sbatch.draw();
            return;
        }
        try { Game.draw() } catch (err) { 
            console.log(err.stack); error = true
        }
    }

    export function tryUpdate(elapsedTime: number) {
        if (error) {
            return;
        }
        try { Game.update(elapsedTime) } catch (err) { 
            console.log(err.stack); error = true 
        }
    }
}