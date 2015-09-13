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
var mat4 = require('/gl-matrix/mat4.js');
var glma = require('/gl-matrix/common.js');

function Geometry () {
    this.vertices = [];
    this.index = 0;
    this.faces = [];
}

Geometry.prototype.addVertex = function (x, y, z) {
    this.vertices.push(new Geometry.Vertex(vec3.fromValues(x, y, z)));
    return this.index++;
};

Geometry.prototype.addVertexNormal = function (position, normal) {
    this.vertices.push(new Geometry.Vertex(position, normal));
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
    this.faces.push(new Geometry.Face(a, b, c));
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

Geometry.Face = function (a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = vec3.create();
};

Geometry.Face.prototype.contains = function(i) {
    return this.a === i || this.b === i || this.c === i;
};

Geometry.Vertex = function (position, normal) {
    this.position = position || vec3.create();
    if (!(this.position instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Argument should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
    this.normal = normal || vec3.create();
    if (!(this.normal instanceof glma.ARRAY_TYPE)) {
        throw TypeError('Argument should be of type "' +
            glma.ARRAY_TYPE_STR + '".');
    }
};

function CubeGeometry (x, y, z) {
    Geometry.call(this);

    // Set default values when not specified and center them.
    x = (x || 1) / 2;
    y = (y || 1) / 2;
    z = (z || 1) / 2;

    // Create the initial normal and vertices.
    var normal = vec3.fromValues(0,0,-1);
    var vertices = [
        vec3.fromValues(-x, y,-z),
        vec3.fromValues( x, y,-z),
        vec3.fromValues(-x,-y,-z),
        vec3.fromValues( x,-y,-z)];

    var self = this;

    // Transforms the initial vertices and normal with the specified transform
    // matrix. Adds the new vertices and returns the indices.
    var transformVertices = function(mat) {
        var result = [];
        for (var i=0; i<vertices.length; i++) {
            var v = vec3.transformMat4(vec3.create(), vertices[i], mat);
            var n = vec3.transformMat4(vec3.create(), normal, mat);
            result.push(self.addVertexNormal(v, n));
        }
        return result;
    };

    // Create the vertices for front, back, left and right.
    for (var i=0; i<4; i++) {
        var verts = transformVertices(
            mat4.fromYRotation(mat4.create(), (i * 90) * Math.PI / 180));
        this.addFace(verts[0], verts[1], verts[2]);
        this.addFace(verts[1], verts[3], verts[2]);
    }

    // Create the vertices for top and bottom.
    for (var i=1; i<4; i+=2) {
        var verts = transformVertices(
            mat4.fromXRotation(mat4.create(), (i * 90) * Math.PI / 180));
        this.addFace(verts[0], verts[1], verts[2]);
        this.addFace(verts[1], verts[3], verts[2]);
    }
}

CubeGeometry.prototype = Object.create(Geometry.prototype);
CubeGeometry.prototype.constructor = CubeGeometry;

function SphereGeometry (subdivisions) {
    Geometry.call(this);

    this.cache = {};

    // The SphereGeometry is written with help from the excellent blogpost
    // 'Creating an icosphere mesh in code' by Andreas Kahler.
    // http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html

    var t = (0.5 + Math.sqrt(5.0)) / 2.0;

    // Create 12 vertices of a icosahedron

    this.addVertex(-0.5,  t,  0);
    this.addVertex( 0.5,  t,  0);
    this.addVertex(-0.5, -t,  0);
    this.addVertex( 0.5, -t,  0);

    this.addVertex( 0, -0.5,  t);
    this.addVertex( 0,  0.5,  t);
    this.addVertex( 0, -0.5, -t);
    this.addVertex( 0,  0.5, -t);

    this.addVertex( t,  0, -0.5);
    this.addVertex( t,  0,  0.5);
    this.addVertex(-t,  0, -0.5);
    this.addVertex(-t,  0,  0.5);

    // Create 20 triangles of the icosahedron

    // 5 faces around point 0
    this.faces.push(new Geometry.Face(0, 11, 5));
    this.faces.push(new Geometry.Face(0, 5, 1));
    this.faces.push(new Geometry.Face(0, 1, 7));
    this.faces.push(new Geometry.Face(0, 7, 10));
    this.faces.push(new Geometry.Face(0, 10, 11));

    // 5 adjacent faces
    this.faces.push(new Geometry.Face(1, 5, 9));
    this.faces.push(new Geometry.Face(5, 11, 4));
    this.faces.push(new Geometry.Face(11, 10, 2));
    this.faces.push(new Geometry.Face(10, 7, 6));
    this.faces.push(new Geometry.Face(7, 1, 8));

    // 5 faces around point 3
    this.faces.push(new Geometry.Face(3, 9, 4));
    this.faces.push(new Geometry.Face(3, 4, 2));
    this.faces.push(new Geometry.Face(3, 2, 6));
    this.faces.push(new Geometry.Face(3, 6, 8));
    this.faces.push(new Geometry.Face(3, 8, 9));

    // 5 adjacent faces
    this.faces.push(new Geometry.Face(4, 9, 5));
    this.faces.push(new Geometry.Face(2, 4, 11));
    this.faces.push(new Geometry.Face(6, 2, 10));
    this.faces.push(new Geometry.Face(8, 6, 7));
    this.faces.push(new Geometry.Face(9, 8, 1));

    for (var i = 0; i < subdivisions || 0; i++) {
        var faces2 = [];
        for (var j=0; j<this.faces.length; j++) {
            // Replace triangle by 4 triangles
            var a = this.addVertexBetween(this.faces[j].a, this.faces[j].b);
            var b = this.addVertexBetween(this.faces[j].b, this.faces[j].c);
            var c = this.addVertexBetween(this.faces[j].c, this.faces[j].a);
            faces2.push(new Geometry.Face(this.faces[j].a, a, c));
            faces2.push(new Geometry.Face(this.faces[j].b, b, a));
            faces2.push(new Geometry.Face(this.faces[j].c, c, b));
            faces2.push(new Geometry.Face(a, b, c));
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
        this, x/length/2, y/length/2, z/length/2);
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
module.exports.Geometry = Geometry;