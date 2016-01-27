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

class Utils {
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  static options(options, object) {
    if (typeof options !== 'object') {
      options = {};
    }
    options.value = function (name, value) {
      if (options[name] === undefined) {
        if (object) {
          object[name] = value;
        }
        if (value === undefined) {
          throw new TypeError(
            'Required option \'' + name + '\' was not specified.');
        }
        return value;
      }
      if (object) {
        object[name] = options[name];
      }
      return options[name];
    };
    return options;
  }

  static enableScriptEdit(module, object, args) {
    var __scriptEditObject = object;
    var __scriptEditArgs = args;
    if (__scriptEditObject.fileWatcher) {
      // Only add the file watcher to an object once.
      return;
    }
    var filepath = module.path + module.filename;
    __scriptEditObject.fileWatcher = new FileWatcher(filepath, function() {
      var source = '#.apply(__scriptEditObject, __scriptEditArgs);' +
          '__scriptEditObject.__proto__ = #.prototype;';
      source = source.replace(/#/g, __scriptEditObject.constructor.name);
      try {
        eval(file.readText(filepath) + source);
      } catch (err) {
        console.log(err.stack);
      }
    });
  }
}

module.exports.Utils = Utils;