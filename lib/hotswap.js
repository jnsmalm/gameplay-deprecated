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
var Callbacks;
(function (Callbacks) {
    Callbacks.done = [];
    Callbacks.fail = [];
})(Callbacks || (Callbacks = {}));
var HotSwap;
(function (HotSwap) {
    let exports = {};
    let objects = {};
    /**
     * Enables an object to swap prototype at runtime when the file changes.
     */
    function add(object, module) {
        let filepath = module.path + "/" + module.filename;
        if (!exports[filepath]) {
            exports[filepath] = module.exports;
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
            throw new TypeError(`Could not find constructor "${ctor}" in module "${filepath}", maybe you misspelled or forgot to export it?`);
        }
        Object.setPrototypeOf(object, exports[filepath][ctor].prototype);
        objects[filepath].push(object);
        try {
            if (object.init) {
                object.init();
            }
        }
        catch (err) {
            console.log(err.stack);
            for (let cb of Callbacks.fail) {
                cb(filepath);
            }
        }
    }
    HotSwap.add = add;
    /**
     * Adds a function to be called when hotswap failed.
     */
    function fail(callback) {
        Callbacks.fail.push(callback);
    }
    HotSwap.fail = fail;
    /**
     * Adds a function to be called when hotswap is done.
     */
    function done(callback) {
        Callbacks.done.push(callback);
    }
    HotSwap.done = done;
    function changed(filepath) {
        console.log(`${filepath} was changed`);
        try {
            exports[filepath] = load(filepath);
            for (let object of objects[filepath]) {
                let ctor = object.constructor.name;
                if (!exports[filepath][ctor]) {
                    throw new TypeError(`Could not find constructor "${ctor}", maybe you changed the name?`);
                }
                Object.setPrototypeOf(object, exports[filepath][ctor].prototype);
                if (object.init) {
                    object.init();
                }
            }
            for (let cb of Callbacks.done) {
                cb(filepath);
            }
        }
        catch (err) {
            console.log(err.stack);
            for (let cb of Callbacks.fail) {
                cb(filepath);
            }
            return;
        }
    }
})(HotSwap = exports.HotSwap || (exports.HotSwap = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90c3dhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhvdHN3YXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQU1YLElBQVUsU0FBUyxDQUdsQjtBQUhELFdBQVUsU0FBUztJQUNGLGNBQUksR0FBbUMsRUFBRSxDQUFDO0lBQzFDLGNBQUksR0FBbUMsRUFBRSxDQUFDO0FBQzNELENBQUMsRUFIUyxTQUFTLEtBQVQsU0FBUyxRQUdsQjtBQUVELElBQWMsT0FBTyxDQWdGcEI7QUFoRkQsV0FBYyxPQUFPO0lBQ2pCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNqQixJQUFJLE9BQU8sR0FFUCxFQUFFLENBQUM7SUFDUDs7T0FFRztJQUNILGFBQW9CLE1BQW9CLEVBQUUsTUFBVztRQUNqRCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQVMsTUFBTyxDQUFDLE9BQU8sQ0FBQztZQUMxQyxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FB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