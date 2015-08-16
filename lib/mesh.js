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

var Geometry = require('/geometry.js').Geometry;
var vec3 = require('/gl-matrix/vec3.js');

var OBJ_VERTEX_INDEX = 0;
var OBJ_TEXTURE_INDEX = 1;
var OBJ_NORMAL_INDEX = 2;

var vertexDeclaration = [
    { name: 'vert', type: 'vec3' },
    { name: 'vertTexCoord', type: 'vec2' },
    { name: 'vertNormal', type: 'vec3' }
];

function createVertices(geometry) {
    var vertices = [];
    for (var i=0; i<geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertices.push(vertex.position[0]);
        vertices.push(vertex.position[1]);
        vertices.push(vertex.position[2]);
        vertices.push(0); //vertices.push(vertex.textureCoords[0]);
        vertices.push(0); //vertices.push(vertex.textureCoords[1]);
        vertices.push(vertex.normal[0]);
        vertices.push(vertex.normal[1]);
        vertices.push(vertex.normal[2]);
    }
    return vertices;
}

function Mesh(graphics, shaderProgram, geometry) {
    this.graphics = graphics;
    this.geometry = geometry;
    this.shaderProgram = shaderProgram;
    this.vertexDataState = new VertexDataState(graphics);
    this.vertexDataState.setVertexDeclaration(vertexDeclaration, shaderProgram);
    this.vertexDataState.setVertices(createVertices(geometry));
    this.vertexDataState.setIndices(geometry.getIndices());
}

Mesh.prototype.draw = function() {
    this.graphics.setVertexDataState(this.vertexDataState);
    this.graphics.setShaderProgram(this.shaderProgram);
    this.graphics.drawIndexedPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: this.geometry.faces.length
    });
};

Mesh.load = function(filepath, graphics, shaderProgram) {
    var obj = loadFromObj(filepath);
    var geometry = new Geometry();

    for (var i=0; i<obj.faceCount; i++) {
        var a = geometry.addVertexNormal(obj.position(i, 0), obj.normal(i, 0));
        var b = geometry.addVertexNormal(obj.position(i, 1), obj.normal(i, 1));
        var c = geometry.addVertexNormal(obj.position(i, 2), obj.normal(i, 2));
        geometry.addFace(a, b, c);

        if (obj.hasVertex(i, 3)) {
            var d = geometry.addVertexNormal(
                obj.position(i, 3), obj.normal(i, 3));
            geometry.addFace(a, c, d);
        }
    }
    return new Mesh(graphics, shaderProgram, geometry);
};

function loadFromObj(filepath) {
    var obj = file.readText(filepath);
    var vertices = [];
    var re = /v\s(-?\d*.\d*)\s(-?\d*.\d*)\s(-?\d*.\d*)/g;
    var m;
    while ((m = re.exec(obj)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        vertices.push(vec3.fromValues(m[1], m[2], m[3]));
    }
    var normals = [];
    re = /vn\s(-?\d*.\d*)\s(-?\d*.\d*)\s(-?\d*.\d*)/g;
    while ((m = re.exec(obj)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        normals.push(vec3.fromValues(m[1], m[2], m[3]));
    }
    var faces = [];
    re = /f\s(\d*)\/(\d*)\/(\d*)\s(\d*)\/(\d*)\/(\d*)\s(\d*)\/(\d*)\/(\d*)\s(\d*)\/?(\d*)\/?(\d*)/g;
    while ((m = re.exec(obj)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        faces.push(m.splice(1, m.length - 1));
    }
    var getPosition = function(faceIndex, vertexIndex) {
        return vertices[faces[faceIndex][OBJ_VERTEX_INDEX + vertexIndex * 3] - 1];
    };
    var getNormal = function(faceIndex, normalIndex) {
        return normals[faces[faceIndex][OBJ_NORMAL_INDEX + normalIndex * 3] - 1];
    };
    var hasVertex = function(faceIndex, vertexIndex) {
        return faces[faceIndex][OBJ_VERTEX_INDEX + vertexIndex * 3] !== '';
    };
    return {
        faces: faces,
        hasVertex: hasVertex,
        position: getPosition,
        normal: getNormal,
        faceCount: faces.length
    };
}

module.exports.Mesh = Mesh;