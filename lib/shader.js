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
var vec4 = require('/gl-matrix/vec4.js');
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

    this.lightCount = 0;
}

BasicShader.prototype.setMaterialTexture = function (texture) {
    if (texture) {
        this.shaderProgram.materialTextureEnabled = 1;
        this.graphics.textures[0] = texture;
    } else {
        this.shaderProgram.materialTextureEnabled = 0;
    }
};

BasicShader.prototype.setMaterialColor = function (value) {
    if (!(value instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Value should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.shaderProgram.materialColor = value;
};

BasicShader.prototype.setMaterialSpecularColor = function (value) {
    if (!(value instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Value should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.shaderProgram.materialSpecularColor = value;
};

BasicShader.prototype.setMaterialShininess = function (value) {
    if (typeof value !== 'number') {
        throw TypeError('Value should be of type "number".');
    }
    this.shaderProgram.materialShininess = value;
};

BasicShader.prototype.setProjection = function (value) {
    if (!(value instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Value should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.shaderProgram.projection = value;
};

BasicShader.prototype.setView = function (value) {
    if (!(value instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Value should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.shaderProgram.view = value;
};

BasicShader.prototype.setModel = function (value) {
    if (!(value instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Value should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.shaderProgram.model = value;
};

BasicShader.prototype.setLightUniform = function (i, name, value) {
    var uniform = 'allLights[' + i + '].' + name;
    this.shaderProgram[uniform] = value;
};

BasicShader.prototype.addLight = function (light) {
    this.setLightUniform(
        this.lightCount, 'position', light.position);
    this.setLightUniform(
        this.lightCount, 'intensities', light.intensities);
    this.setLightUniform(
        this.lightCount, 'ambientCoefficient', light.ambientCoefficient);
    this.setLightUniform(
        this.lightCount, 'attenuation', light.attenuation);
    this.setLightUniform(
        this.lightCount, 'coneAngle', light.coneAngle);
    this.setLightUniform(
        this.lightCount, 'coneDirection', light.coneDirection);
    this.lightCount++;
    this.shaderProgram.numLights = this.lightCount;
};

BasicShader.Vertex = function (options) {
    options = options || {};
    this.position = options.position || vec3.create();
    if (!(this.position instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Argument "position" should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.textureCoords = options.textureCoords || vec2.create();
    if (!(this.textureCoords instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Argument "textureCoords" should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.normal = options.normal || vec3.create();
    if (!(this.normal instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Argument "normal" should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
};

BasicShader.Vertex.declaration = function () {
    return [
        { name: 'vert', type: 'vec3' },
        { name: 'vertTexCoord', type: 'vec2' },
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
    this.vertices.push(vertex.textureCoords[0]);
    this.vertices.push(vertex.textureCoords[1]);
    this.vertices.push(vertex.normal[0]);
    this.vertices.push(vertex.normal[1]);
    this.vertices.push(vertex.normal[2]);
};

BasicShader.VertexList.prototype.toArray = function () {
    return this.vertices;
};

BasicShader.Light = function () {
    this.position = vec4.create();
    this.intensities = vec3.fromValues(1,1,1);
    this.attenuation = 0;
    this.ambientCoefficient = 0.1;
    this.coneAngle = 0;
    this.coneDirection = vec3.create();
};

BasicShader.PointLight = function (x, y, z) {
    BasicShader.Light.call(this);
    vec4.set(this.position, x || 0, y || 0, z || 0, 1);
};

BasicShader.PointLight.prototype = Object.create(BasicShader.Light.prototype);
BasicShader.PointLight.prototype.constructor = BasicShader.PointLight;

BasicShader.DirectionalLight = function (x, y, z) {
    BasicShader.Light.call(this);
    vec4.set(this.position, x || 0, y || 0, z || 0, 0);
};

BasicShader.DirectionalLight.prototype =
    Object.create(BasicShader.Light.prototype);
BasicShader.DirectionalLight.prototype.constructor =
    BasicShader.DirectionalLight;

BasicShader.SpotLight = function () {
    BasicShader.Light.call(this);
    vec4.set(this.position, 0, 0, 5, 1);
    this.coneAngle = 10;
    vec3.set(this.coneDirection, 0, 0, -1);
};

BasicShader.SpotLight.prototype = Object.create(BasicShader.Light.prototype);
BasicShader.SpotLight.prototype.constructor = BasicShader.SpotLight;

module.exports.BasicShader = BasicShader;
