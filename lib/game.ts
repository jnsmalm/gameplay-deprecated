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

import { Color } from "./color"

export module Game {

    export let clearColor: Color;
    export let fps: number = 0;
    export let graphics: Graphics;
    export let keyboard: Keyboard;
    export let mouse: Mouse;
    export let timer: Timer;
    export let window: Window;
    export let escapeKeyExit = true;

    let currentTime: number = 0;
    let lastTime: number = 0;
    let elapsedTime: number = 0;
    let numberOfFrames: number = 0;
    let targetElapsedTime: number = 0;
    let timeAccumulator: number = 0;

    export function init(options: GameOptions = {}) {
        clearColor = options.clearColor || new Color(0.3, 0.3, 0.3, 1);
        targetElapsedTime = options.targetElapsedTime || 1 / 60;

        if (options.startFileWatcher) {
            FileWatcher.start();
        }
        window = new Window();
        keyboard = new Keyboard(window);
        mouse = new Mouse(window);
        timer = new Timer();
        graphics = window.graphics;
    }

    export function run() {
        while (!window.isClosing()) {
            let currentTime = timer.elapsed();
            let frameTime = currentTime - lastTime;
            if ((elapsedTime += frameTime) >= 1) {
                elapsedTime -= 1;
                fps = numberOfFrames;
                numberOfFrames = 0;
            }
            step(currentTime, frameTime);
            lastTime = currentTime;
        }
    }
    /**
     * Exits the game.
     */
    export function exit() {
        window.close();
    }

    export function update(elapsedTime: number) {
        // Implemented by the user
    }

    export function draw() {
        // Implemented by the user
    }

    function step(currentTime: number, frameTime: number) {
        window.pollEvents();
        let updated = false;
        timeAccumulator += frameTime;
        while (timeAccumulator >= targetElapsedTime) {
            keyboard.updateState();
            if (escapeKeyExit && keyboard.isKeyDown(256)) {
                Game.exit();
                return;
            }
            mouse.updateState();
            Game.update(targetElapsedTime);
            timeAccumulator -= targetElapsedTime;
            if (timeAccumulator <= targetElapsedTime / 2) {
                // Lock updates exactly to the monitor refresh (in order to
                // avoid endlessly accumulating small time deltas, which would 
                // eventually add up enough to cause a dropped frame).
                timeAccumulator = 0;
            }
            updated = true;
        }
        if (updated) {
            window.graphics.clear('default', clearColor);
            Game.draw();
            window.graphics.present();
            numberOfFrames++;
            FileWatcher.handleEvents();
        }
    }
}

export interface GameOptions {
    clearColor?: Color;
    height?: number;
    startFileWatcher?: boolean;
    targetElapsedTime?: number;
    width?: number;
}