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

var mat4 = require('/gl-matrix/mat4.js');
var vec2 = require('/gl-matrix/vec2.js');
var vec3 = require('/gl-matrix/vec3.js');
var glma = require('/gl-matrix/common.js');

function BasicShader (window) {
    this.graphics = window.graphics;

    this.shaderProgram = new ShaderProgram(
        window.graphics, module.path + 'assets/shaders/basic');

    this.shaderProgram.projection = mat4.perspective(mat4.create(),
        (Math.PI / 180) * 45, window.width/window.height, 1, 1000);

    this.shaderProgram.view = mat4.lookAt(mat4.create(),
        vec3.fromValues(0, 0, 5),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0));

    this.shaderProgram.model = mat4.create();
}

BasicShader.prototype.setTexture = function (texture) {
    if (texture) {
        this.shaderProgram.textureEnabled = 1;
        this.graphics.textures[0] = texture;
    } else {
        this.shaderProgram.textureEnabled = 0;
    }
};

BasicShader.prototype.setProjection = function (value) {
    this.shaderProgram.projection = value;
};

BasicShader.prototype.setView = function (value) {
    this.shaderProgram.view = value;
};

BasicShader.prototype.setModel = function (value) {
    this.shaderProgram.model = value;
};

BasicShader.Vertex = function (options) {
    options = options || {};
    this.position = options.position || vec3.create();
    if (!(this.position instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Position should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    //this.textureCoordinates = options.textureCoordinates || vec2.create();
    this.normal = options.normal || vec3.create();
    if (!(this.normal instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Normal should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
};

BasicShader.Vertex.declaration = function () {
    return [
        { name: 'vert', type: 'vec3' },
        //{ name: 'vertTexCoord', type: 'vec2' },
        { name: 'vertNormal', type: 'vec3' }
    ];
};

BasicShader.VertexList = function (vertices) {
    this.vertices = [];
    if (vertices) {
        for (var i=0; i<vertices.length; i++) {
            this.add(vertices[i]);
        }
    }
};

BasicShader.VertexList.prototype.add = function (vertex) {
    this.vertices.push(vertex.position[0]);
    this.vertices.push(vertex.position[1]);
    this.vertices.push(vertex.position[2]);
    /*this.vertices.push(vertex.textureCoordinates.u);
    this.vertices.push(vertex.textureCoordinates.v);*/
    this.vertices.push(vertex.normal[0]);
    this.vertices.push(vertex.normal[1]);
    this.vertices.push(vertex.normal[2]);
};

BasicShader.VertexList.prototype.toArray = function () {
    return this.vertices;
};

module.exports.BasicShader = BasicShader;
