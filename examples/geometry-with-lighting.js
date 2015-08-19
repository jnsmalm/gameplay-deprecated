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
var vec4 = require('/../lib/gl-matrix/vec4.js');
var mat4 = require('/../lib/gl-matrix/mat4.js');
var geometry = require('/../lib/geometry.js');
var keys = require('/../lib/keys.js');

var game = new Game({
    width: 1024,
    height: 576,
    fullscreen: false
});

var graphics = game.graphics;

var basicShader = SetupBasicShader();

var cube = new GeometryDataState(
    new geometry.CubeGeometry(1,1,1), vec3.fromValues(1,0,0));

var sphere = new GeometryDataState(
    new geometry.SphereGeometry(3), vec3.fromValues(0,1,0));

function SetupBasicShader () {
    var basicShader = new BasicShader(game.window);
    graphics.setShaderProgram(basicShader.shaderProgram);
    basicShader.setMaterialShininess(0.8);
    basicShader.setMaterialSpecularColor(vec3.fromValues(0.1,0.1,0.1));
    basicShader.addLight(new BasicShader.PointLight(0,0,1));
    return basicShader;
}

function GeometryDataState (geom, materialColor) {
    var vertices = new BasicShader.VertexList();
    for (var i=0; i<geom.vertices.length; i++) {
        vertices.add(new BasicShader.Vertex({
            position: geom.vertices[i].position,
            normal: geom.vertices[i].normal
        }));
    }
    this.vertexDataState = new VertexDataState(graphics);
    this.vertexDataState.setVertexDeclaration(BasicShader.Vertex.declaration(),
        basicShader.shaderProgram);
    this.vertexDataState.setVertices(vertices.toArray(), 'static');
    this.vertexDataState.setIndices(geom.getIndices());
    this.numberOfFaces = geom.faces.length;
    this.materialColor = materialColor || vec3.fromValues(1,1,1);
}

GeometryDataState.prototype.draw = function (model) {
    basicShader.setModel(model);
    basicShader.setMaterialColor(this.materialColor);
    graphics.setVertexDataState(this.vertexDataState);
    graphics.drawIndexedPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: this.numberOfFaces
    });
};

function createTransformationModel (x, y, z, scaling, rotation) {
    var translate = mat4.fromTranslation(
        mat4.create(), vec3.fromValues(x,y,z));
    var scale = mat4.fromScaling(
        mat4.create(), vec3.fromValues(scaling, scaling, scaling));
    var rotate = mat4.fromYRotation(mat4.create(), rotation);
    var model = mat4.create();
    mat4.multiply(model, translate, rotate);
    mat4.multiply(model, model, scale);
    return model;
}

game.update = function (elapsed) {
    if (game.keyboard.isKeyDown(keys.ESCAPE)) {
        game.exit();
    }
};

game.draw = function () {
    cube.draw(createTransformationModel(-1.5,0,0,1.3,game.timer.elapsed()));
    sphere.draw(createTransformationModel(
        1.5,Math.sin(game.timer.elapsed())*0.7,0,0.9,0));
};

game.run();

