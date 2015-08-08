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

var vec3 = require('/gl-matrix/vec3.js');

function Geometry () {
    this.vertices = [];
    this.index = 0;
    this.faces = [];
}

Geometry.prototype.addVertex = function (x, y, z) {
    this.vertices.push(new Vertex(x, y, z));
    return this.index++;
};

Geometry.prototype.addFace = function (a, b, c) {
    if (this.vertices.length - 1 < a) {
        throw new TypeError("Couldn't add face with vertex index " + a + ".");
    }
    if (this.vertices.length - 1 < b) {
        throw new TypeError("Couldn't add face with vertex index " + b + ".");
    }
    if (this.vertices.length - 1 < c) {
        throw new TypeError("Couldn't add face with vertex index " + c + ".");
    }
    this.faces.push(new Face(a, b, c));
};

Geometry.prototype.calculateNormals = function () {
    // Calculate face normals
    for (var i=0; i<this.faces.length; i++) {
        var face = this.faces[i];
        var edge1 = vec3.subtract(vec3.create(),
            this.vertices[face.b].position, this.vertices[face.a].position);
        var edge2 = vec3.subtract(vec3.create(),
            this.vertices[face.c].position, this.vertices[face.a].position);
        vec3.normalize(face.normal, vec3.cross(vec3.create(), edge1, edge2));
    }
    // Calculate vertex normals
    var sum = vec3.create();
    for (var i=0; i<this.vertices.length; i++) {
        vec3.set(sum, 0, 0, 0);
        for (var j=0; j<this.faces.length; j++) {
            if (this.faces[j].contains(i)) {
                vec3.add(sum, sum, this.faces[j].normal);
            }
        }
        vec3.normalize(this.vertices[i].normal, sum);
    }
};

Geometry.prototype.getIndices = function () {
    var indices = [];
    for (var i=0; i<this.faces.length; i++) {
        indices.push(this.faces[i].a);
        indices.push(this.faces[i].b);
        indices.push(this.faces[i].c);
    }
    return indices;
};

function Face (a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = vec3.create();
}

Face.prototype.contains = function(i) {
    return this.a === i || this.b === i || this.c === i;
};

function Vertex (x, y, z) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
}

function CubeGeometry (x, y, z) {
    Geometry.call(this);

    // Create 8 vertices for the cube.

    x = (x || 1) / 2;
    y = (y || 1) / 2;
    z = (z || 1) / 2;

    var v0 = this.addVertex(-x, y,-z);
    var v1 = this.addVertex( x, y,-z);
    var v2 = this.addVertex(-x,-y,-z);
    var v3 = this.addVertex( x,-y,-z);

    var v4 = this.addVertex(-x, y, z);
    var v5 = this.addVertex( x, y, z);
    var v6 = this.addVertex(-x,-y, z);
    var v7 = this.addVertex( x,-y, z);

    // Front
    this.addFace(v0, v1, v2);
    this.addFace(v1, v3, v2);

    // Back
    this.addFace(v5, v4, v7);
    this.addFace(v6, v7, v4);

    // Left
    this.addFace(v6, v4, v0);
    this.addFace(v6, v0, v2);

    // Right
    this.addFace(v1, v5, v3);
    this.addFace(v5, v7, v3);

    // Top
    this.addFace(v4, v5, v0);
    this.addFace(v1, v0, v5);

    // Bottom
    this.addFace(v6, v2, v7);
    this.addFace(v7, v2, v3);

    this.calculateNormals();
}

CubeGeometry.prototype = Object.create(Geometry.prototype);
CubeGeometry.prototype.constructor = CubeGeometry;

function SphereGeometry (subdivisions) {
    Geometry.call(this);

    this.cache = {};

    // The SphereGeometry is written with help from the excellent blogpost
    // 'Creating an icosphere mesh in code' by Andreas Kahler.
    // http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html

    var t = (1.0 + Math.sqrt(5.0)) / 2.0;

    // Create 12 vertices of a icosahedron

    this.addVertex(-1,  t,  0);
    this.addVertex( 1,  t,  0);
    this.addVertex(-1, -t,  0);
    this.addVertex( 1, -t,  0);

    this.addVertex( 0, -1,  t);
    this.addVertex( 0,  1,  t);
    this.addVertex( 0, -1, -t);
    this.addVertex( 0,  1, -t);

    this.addVertex( t,  0, -1);
    this.addVertex( t,  0,  1);
    this.addVertex(-t,  0, -1);
    this.addVertex(-t,  0,  1);

    // Create 20 triangles of the icosahedron

    // 5 faces around point 0
    this.faces.push(new Face(0, 11, 5));
    this.faces.push(new Face(0, 5, 1));
    this.faces.push(new Face(0, 1, 7));
    this.faces.push(new Face(0, 7, 10));
    this.faces.push(new Face(0, 10, 11));

    // 5 adjacent faces
    this.faces.push(new Face(1, 5, 9));
    this.faces.push(new Face(5, 11, 4));
    this.faces.push(new Face(11, 10, 2));
    this.faces.push(new Face(10, 7, 6));
    this.faces.push(new Face(7, 1, 8));

    // 5 faces around point 3
    this.faces.push(new Face(3, 9, 4));
    this.faces.push(new Face(3, 4, 2));
    this.faces.push(new Face(3, 2, 6));
    this.faces.push(new Face(3, 6, 8));
    this.faces.push(new Face(3, 8, 9));

    // 5 adjacent faces
    this.faces.push(new Face(4, 9, 5));
    this.faces.push(new Face(2, 4, 11));
    this.faces.push(new Face(6, 2, 10));
    this.faces.push(new Face(8, 6, 7));
    this.faces.push(new Face(9, 8, 1));

    for (var i = 0; i < subdivisions || 0; i++) {
        var faces2 = [];
        for (var j=0; j<this.faces.length; j++) {
            // Replace triangle by 4 triangles
            var a = this.addVertexBetween(this.faces[j].a, this.faces[j].b);
            var b = this.addVertexBetween(this.faces[j].b, this.faces[j].c);
            var c = this.addVertexBetween(this.faces[j].c, this.faces[j].a);
            faces2.push(new Face(this.faces[j].a, a, c));
            faces2.push(new Face(this.faces[j].b, b, a));
            faces2.push(new Face(this.faces[j].c, c, b));
            faces2.push(new Face(a, b, c));
        }
        this.faces = faces2;
    }

    this.calculateNormals();
}

SphereGeometry.prototype = Object.create(Geometry.prototype);
SphereGeometry.prototype.constructor = SphereGeometry;

SphereGeometry.prototype.addVertex = function (x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z);
    return Geometry.prototype.addVertex.call(
        this, x/length, y/length, z/length);
};

SphereGeometry.prototype.addVertexBetween = function (p1, p2) {
    // first check if we have it already
    var firstIsSmaller = p1 < p2;
    var smallerIndex = firstIsSmaller ? p1 : p2;
    var greaterIndex = firstIsSmaller ? p2 : p1;
    var key = smallerIndex+','+greaterIndex;

    if (this.cache[key]) {
        return this.cache[key];
    }

    // not in cache, calculate it
    var point1 = this.vertices[p1].position;
    var point2 = this.vertices[p2].position;
    var x = (point1[0] + point2[0]) / 2.0;
    var y = (point1[1] + point2[1]) / 2.0;
    var z = (point1[2] + point2[2]) / 2.0;

    this.cache[key] = this.addVertex(x, y, z);

    return this.cache[key];
};

module.exports.CubeGeometry = CubeGeometry;
module.exports.SphereGeometry = SphereGeometry;