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

var Game = require('/../lib/game.js').Game;
var BasicShader = require('/../lib/shader.js').BasicShader;
var vec3 = require('/../lib/gl-matrix/vec3.js');
var mat4 = require('/../lib/gl-matrix/mat4.js');
var keys = require('/../lib/keys.js');
var Mesh = require('/../lib/mesh.js').Mesh;

var game = new Game({
    width: 1024,
    height: 576,
    fullscreen: false
});

var graphics = game.graphics;

var basicShader = new BasicShader(game.window);
basicShader.setMaterialShininess(0.8);
basicShader.setMaterialSpecularColor(vec3.fromValues(0.1,0.1,0.1));
basicShader.setMaterialColor(vec3.fromValues(0.9,0.9,0.9));

var pointLight = new BasicShader.PointLight(-2,0,0)
pointLight.intensities = vec3.fromValues(1,1,1);
basicShader.addLight(pointLight);

var dirLight = new BasicShader.DirectionalLight(0,-3,0);
dirLight.intensities = vec3.fromValues(1,0,0);
basicShader.addLight(dirLight);

var mesh = Mesh.load('/assets/suzanne.obj', graphics,
    basicShader.shaderProgram);

game.update = function (elapsed) {
    if (game.keyboard.isKeyDown(keys.ESCAPE)) {
        game.exit();
    }
};

game.draw = function () {
    basicShader.setModel(mat4.fromYRotation(
        mat4.create(), game.timer.elapsed()));
    mesh.draw();
};

game.run();

