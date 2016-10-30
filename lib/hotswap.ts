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

interface HotSwappable {
    init?(): void;
}

namespace Callbacks {
    export const done: ((filepath: string) => void)[] = [];
    export const fail: ((filepath: string) => void)[] = [];
}

export module HotSwap {
    let exports = {};
    let objects: {
        [filepath: string]: HotSwappable[]
    } = {};
    /**
     * Enables an object to swap prototype at runtime when the file changes.
     */
    export function add(object: HotSwappable, module: any) {
        let filepath = module.path + "/" + module.filename;
        if (!exports[filepath]) {
            exports[filepath] = (<any>module).exports;
            let fw = new FileWatcher(filepath, () => {
                changed(filepath);
            });
        }
        if (!objects[filepath]) {
            objects[filepath] = [];
        }
        if (objects[filepath].indexOf(object) >= 0) {
            return;
        }
        let ctor = object.constructor.name;
        if (!exports[filepath][ctor]) {
            throw new TypeError(
                `Could not find constructor "${ctor}" in module "${filepath}", maybe you misspelled or forgot to export it?`);
        }
        Object.setPrototypeOf(object, exports[filepath][ctor].prototype);
        objects[filepath].push(object);
        try {
            if (object.init) { 
                object.init();
            }
        } catch (err) {
            console.log(err.stack);
            for (let cb of Callbacks.fail) {
                cb(filepath);
            }
        }
    }
    /**
     * Adds a function to be called when hotswap failed.
     */
    export function fail(callback: (filepath: string) => void) {
        Callbacks.fail.push(callback);
    }
    /**
     * Adds a function to be called when hotswap is done.
     */
    export function done(callback: (filepath: string) => void) {
        Callbacks.done.push(callback);
    }

    function changed(filepath: string) {
        console.log(`${filepath} was changed`);
        try {
            exports[filepath] = load(filepath);
            for (let object of objects[filepath]) {
                let ctor = object.constructor.name;
                if (!exports[filepath][ctor]) {
                    throw new TypeError(
                        `Could not find constructor "${ctor}", maybe you changed the name?`);
                }
                Object.setPrototypeOf(
                    object, exports[filepath][ctor].prototype);
                if (object.init) { 
                    object.init();
                }
            }
            for (let cb of Callbacks.done) {
                cb(filepath);
            }
        } catch (err) {
            console.log(err.stack);
            for (let cb of Callbacks.fail) {
                cb(filepath);
            }
            return;
        }
    }
}