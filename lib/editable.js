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

var Camera = require('./camera.js').Camera;
var Game = require('./game.js').Game;
var Sprite = require('./sprite.js').Sprite;

var editables = {};

class EditableModule {
  constructor(module) {
    this.filepath = module.path + '/' + module.filename;
    if (editables[this.filepath]) {
      // Only keep a single editable module per filepath.
      return editables[this.filepath];
    }
    editables[this.filepath] = this;
    // Create the file watcher which will trigger the callback if the specified 
    // filepath was changed.
    var watcher = new FileWatcher(this.filepath, this.changed.bind(this));
    this.objects = [];
    this.protos = {};
    this.module = module;
  }

  setup(object) {
    if (this.objects.indexOf(object) >= 0) {
      return;
    }
    this.objects.push(object);
    var name = object.constructor.name;
    if (this.protos[name]) {
      // When available, update to the latest prototype.
      object.__proto__ = this.protos[name];
    } else {
      // Keep a reference of the prototype.
      this.protos[name] = object.__proto__;
    }
    if (object.setup) {
      object.setup();
    }
  }

  changed() {
    if (editableGame) {
      // Remove the current error so the game can continue to run.
      editableGame.error = null;
    }
    for (var i=this.objects.length-1; i>=0; i--) {
      if (this.objects[i].destroyed) {
        this.objects.splice(i, 1);
      }
    }
    try {
      // At this time the current module object is the 'editable' module, set 
      // the correct one before executing.
      module = this.module;
      // Read and execute the changed file contents together with the update 
      // string, then load the updated objects.
      eval(file.readText(this.filepath) + this.string());
      for (var i=0; i<this.objects.length; i++) {
        if (this.objects[i].setup) {
          this.objects[i].setup();
        }
      }
      console.log(
        `${this.time()} File '${this.filepath}' was changed, `+
        `${this.objects.length} object(s) was updated.`);
    } catch (err) {
      console.log(err.stack);
    }
  }

  string() {
    var str = '';
    // Build the string used for updating the prototype for the objects.
    for (var i=0; i<this.objects.length; i++) {
      var name = this.objects[i].constructor.name;
      // Update the object's prototype.
      str += `this.objects[${i}].__proto__ = ${name}.prototype;`;
    }
    for (var p in this.protos) {
      // Keep a reference of the latest prototype.
      str += `this.protos['${p}'] = ${p}.prototype;`;
    }
    return str;
  }

  time() {
    function f(value) {
      return (value < 10 ? '0' : '') + value;
    };
    var s = f(new Date().getSeconds());
    var h = f(new Date().getHours());
    var m = f(new Date().getMinutes());
    return `${h}:${m}:${s}`;
  };
}

var editableGame;

class EditableGame extends Game {
  constructor(options) {
    if (editableGame) {
      // Don't create a new game if one already exists.
      return editableGame;
    }
    super(options);
    editableGame = this;

    Sprite.init(this.window);
    this.sprite = new Sprite(module.path + '/assets/error.png');
    this.sprite.pixelsPerUnit = 1;
    this.camera = new Camera({
      window: this.window,
      orthographicSize: this.window.height/2,
      orthographic: true
    });

    FileWatcher.start();
  }

  update(elapsed) {
    FileWatcher.handleEvents();
    if (this.error) {
      return;
    }
    try {
      super.update(elapsed);
    } catch (err) {
      console.log(err.stack);
      this.error = err;
    }
  }

  draw() {
    if (this.error) {
      this.drawError();
      return;
    }
    try {
      super.draw();
    } catch (err) {
      console.log(err.stack);
      this.error = err;
    }
  }

  drawError() {
    var camera = Sprite.camera;
    Sprite.camera = this.camera;
    this.sprite.draw();
    Sprite.drawBatched();
    Sprite.camera = camera;
  }
}

module.exports.EditableModule = EditableModule;
module.exports.EditableGame = EditableGame;