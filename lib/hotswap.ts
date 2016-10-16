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

export module HotSwap {
    let listeners: ((filepath: string) => void)[] = [];
    let exports = {};
    let objects: {
        [filepath: string]: HotSwappable[]
    } = {};
    
    export function changed(callback: (filepath: string) => void) {
        listeners.push(callback);
    }

    /** Enables an object to swap prototype at runtime when the file changes. */
    export function setup(
        object: HotSwappable, module: { filename: string, path: string }) {

        let filepath = module.path + "/" + module.filename;
        if (!exports[filepath]) {
            exports[filepath] = (<any>module).exports;
            let fw = new FileWatcher(filepath, () => {
                fileChanged(filepath);
            });
        }
        if (!objects[filepath]) {
            objects[filepath] = [];
        }
        if (objects[filepath].indexOf(object) >= 0) {
            return;
        }
        let ctor = object.constructor.name;
        Object.setPrototypeOf(object, exports[filepath][ctor].prototype);
        objects[filepath].push(object);
        if (object.init) { object.init(); }
    }

    function fileChanged(filepath: string) {
        console.log(`${filepath} was changed`);
        try {
            exports[filepath] = load(filepath);
        } catch (err) {
            console.log(err);
            return;
        }
        for (let object of objects[filepath]) {
            let ctor = object.constructor.name;
            if (!exports[filepath][ctor]) {
                throw new TypeError(
                    `Could not find constructor "${ctor}", has the name changed?`);
            }
            Object.setPrototypeOf(
                object, exports[filepath][ctor].prototype);
            if (object.init) { object.init(); }
        }
        for (let s of listeners) {
            s(filepath);
        }
    }
}