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

function Geometry () {
    this.positions = [];
    this.elements = [];
    this.index = 0;
}

Geometry.prototype.addPosition = function (x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z);
    this.positions.push({ x: x/length, y: y/length, z: z/length });
    return this.index++;
};

function CubeGeometry (x, y, z) {
    Geometry.call(this);

    // Create 8 vertices for the cube.

    x = x || 1 / 2;
    y = y || 1 / 2;
    z = z || 1 / 2;

    var a = this.addPosition(-x, y,-z);
    var b = this.addPosition( x, y,-z);
    var c = this.addPosition(-x,-y,-z);
    var d = this.addPosition( x,-y,-z);

    var e = this.addPosition(-x, y, z);
    var f = this.addPosition( x, y, z);
    var g = this.addPosition(-x,-y, z);
    var h = this.addPosition( x,-y, z);

    // Front
    this.elements.push(a);
    this.elements.push(c);
    this.elements.push(b);
    this.elements.push(b);
    this.elements.push(c);
    this.elements.push(d);

    // Back
    this.elements.push(e);
    this.elements.push(g);
    this.elements.push(f);
    this.elements.push(f);
    this.elements.push(g);
    this.elements.push(h);

    // Left
    this.elements.push(e);
    this.elements.push(g);
    this.elements.push(a);
    this.elements.push(a);
    this.elements.push(g);
    this.elements.push(c);

    // Right
    this.elements.push(b);
    this.elements.push(d);
    this.elements.push(f);
    this.elements.push(f);
    this.elements.push(d);
    this.elements.push(h);

    // Top
    this.elements.push(e);
    this.elements.push(a);
    this.elements.push(f);
    this.elements.push(f);
    this.elements.push(a);
    this.elements.push(b);

    // Bottom
    this.elements.push(g);
    this.elements.push(c);
    this.elements.push(h);
    this.elements.push(h);
    this.elements.push(c);
    this.elements.push(d);
}

CubeGeometry.prototype = Object.create(Geometry.prototype);
CubeGeometry.prototype.constructor = CubeGeometry;

function TriangleElements(v1, v2, v3) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
}

function SphereGeometry (subdivisions) {
    Geometry.call(this);

    // The SphereGeometry is written with help from the excellent blogpost
    // 'Creating an icosphere mesh in code' by Andreas Kahler.
    // http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html

    var t = (1.0 + Math.sqrt(5.0)) / 2.0;

    // Create 12 vertices of a icosahedron

    this.index = 0;

    this.addPosition(-1,  t,  0);
    this.addPosition( 1,  t,  0);
    this.addPosition(-1, -t,  0);
    this.addPosition( 1, -t,  0);
    this.addPosition( 0, -1,  t);
    this.addPosition( 0,  1,  t);
    this.addPosition( 0, -1, -t);
    this.addPosition( 0,  1, -t);
    this.addPosition( t,  0, -1);
    this.addPosition( t,  0,  1);
    this.addPosition(-t,  0, -1);
    this.addPosition(-t,  0,  1);

    // Create 20 triangles of the icosahedron

    var faces = [];

    // 5 faces around point 0
    faces.push(new TriangleElements(0, 11, 5));
    faces.push(new TriangleElements(0, 5, 1));
    faces.push(new TriangleElements(0, 1, 7));
    faces.push(new TriangleElements(0, 7, 10));
    faces.push(new TriangleElements(0, 10, 11));

    // 5 adjacent faces
    faces.push(new TriangleElements(1, 5, 9));
    faces.push(new TriangleElements(5, 11, 4));
    faces.push(new TriangleElements(11, 10, 2));
    faces.push(new TriangleElements(10, 7, 6));
    faces.push(new TriangleElements(7, 1, 8));

    // 5 faces around point 3
    faces.push(new TriangleElements(3, 9, 4));
    faces.push(new TriangleElements(3, 4, 2));
    faces.push(new TriangleElements(3, 2, 6));
    faces.push(new TriangleElements(3, 6, 8));
    faces.push(new TriangleElements(3, 8, 9));

    // 5 adjacent faces
    faces.push(new TriangleElements(4, 9, 5));
    faces.push(new TriangleElements(2, 4, 11));
    faces.push(new TriangleElements(6, 2, 10));
    faces.push(new TriangleElements(8, 6, 7));
    faces.push(new TriangleElements(9, 8, 1));

    for (var i = 0; i < subdivisions || 0; i++) {
        var faces2 = [];
        for (var j=0; j<faces.length; j++) {
            // Replace triangle by 4 triangles
            var a = this.addPositionBetween(faces[j].v1, faces[j].v2);
            var b = this.addPositionBetween(faces[j].v2, faces[j].v3);
            var c = this.addPositionBetween(faces[j].v3, faces[j].v1);
            faces2.push(new TriangleElements(faces[j].v1, a, c));
            faces2.push(new TriangleElements(faces[j].v2, b, a));
            faces2.push(new TriangleElements(faces[j].v3, c, b));
            faces2.push(new TriangleElements(a, b, c));
        }
        faces = faces2;
    }

    for (var i=0; i<faces.length; i++) {
        this.elements.push(faces[i].v1);
        this.elements.push(faces[i].v2);
        this.elements.push(faces[i].v3);
    }
}

SphereGeometry.prototype = Object.create(Geometry.prototype);
SphereGeometry.prototype.constructor = SphereGeometry;

SphereGeometry.prototype.addPositionBetween = function (p1, p2) {
    var x = (this.positions[p1].x + this.positions[p2].x) / 2.0;
    var y = (this.positions[p1].y + this.positions[p2].y) / 2.0;
    var z = (this.positions[p1].z + this.positions[p2].z) / 2.0;
    return this.addPosition(x, y, z);
};

module.exports.CubeGeometry = CubeGeometry;
module.exports.SphereGeometry = SphereGeometry;