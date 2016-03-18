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

module.exports.include = function() {
  var result = {};
  for (var i=0; i<arguments.length; i++) {
    var _module = require(arguments[i]);
    for (var key in _module) {
      result[key] = _module[key];
    }
  }
  return result;
};

module.exports.library = function() {
  var library = module.exports.include(
    module.path + '/entity.js',
    module.path + '/collision.js',
    module.path + '/game.js',
    module.path + '/sprite.js',
    module.path + '/model.js',
    module.path + '/transform.js',
    module.path + '/camera.js',
    module.path + '/utils.js',
    module.path + '/scene.js',
    module.path + '/light.js',
    module.path + '/keys.js',
    module.path + '/math.js',
    module.path + '/physics.js',
    module.path + '/color.js',
    module.path + '/editable.js',
    module.path + '/shader.js'
  );
  library.include = function() {
    var result = module.exports.include.apply(null, arguments);
    for (var key in library) {
      result[key] = library[key];
    }
    return result;
  };
  return library;
};