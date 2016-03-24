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

var Vector3 = require('./math.js').Vector3;
var Camera = require('./camera.js').Camera;

class Shader {
  constructor(graphics, filepath) {
    this.graphics = graphics;
    this.program = new ShaderProgram(graphics, filepath);
  }

  createVertexDataState() {
    throw new TypeError('This method must be implemented by the user.');
  }

  drawModel(model) {
    this.graphics.setShaderProgram(this.program);
    for (var i=0; i<model.meshes.length; i++) {
      var mesh = model.meshes[i];
      this.onDrawingMesh(mesh);
      this.graphics.setVertexDataState(mesh.vertexDataState);
      this.graphics.drawIndexedPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: mesh.geometry.faces.length / 3
      });
    }
  }

  onDrawingMesh(mesh) {
    throw new TypeError('This method must be implemented by the user.');
  }
}

class BasicShader extends Shader {
  constructor(window) {
    super(window.graphics, module.path + '/assets/shaders/basic');
    this.createVertexDataState = BasicShader.createVertexDataState.bind(this);
    this.light = {
      direction: new Vector3(1,-1,-1),
      diffuse: new Vector3(1,1,1),
      ambient: new Vector3(0.3,0.3,0.3)
    };
    this.camera = new Camera({ window: window });
  }

  onDrawingMesh(mesh) {
    this.program.model = mesh.transform.world;
    if (mesh.material.diffuseMap) {
      this.program['material.enableDiffuseMap'] = 1;
      this.program['material.diffuseMap'] = 0;
      this.graphics.textures[0] = mesh.material.diffuseMap;
    } else {
      this.program['material.enableDiffuseMap'] = 0;
      this.program['material.diffuse'] = mesh.material.diffuse;
    }
  }

  update() {
    this.program['light.direction'] = this.light.direction;
    this.program['light.diffuse'] = this.light.diffuse;
    this.program['light.ambient'] = this.light.ambient;
    this.program.view = this.camera.view;
    this.program.projection = this.camera.projection;
  }

  static createVertexDataState(geometry) {
    var vertexDataState = new VertexDataState(this.graphics);
    vertexDataState.setVertexDeclaration([
      { name: 'position', type: 'vec3' },
      { name: 'normal', type: 'vec3' },
      { name: 'texCoords', type: 'vec2' }
    ], this.program);

    var vertices = geometry.vertices;
    var normals = geometry.normals;
    var texCoords = geometry.texCoords;

    var vertexData = new NumberArray();
    for (var i=0; i<vertices.length; i++) {
      vertexData.push(
        vertices[i].x, vertices[i].y, vertices[i].z
      );
      if (normals) {
        vertexData.push(
          normals[i].x, normals[i].y, normals[i].z
        );
      } else {
        vertexData.push(0, 0, 0);
      }
      if (texCoords) {
        vertexData.push(texCoords[i].x, texCoords[i].y);
      } else {
        vertexData.push(0, 0);
      }
    }

    var indices = new NumberArray();
    for (var i=0; i<geometry.faces.length; i++) {
      indices.push(geometry.faces[i]);
    }

    vertexDataState.setVertices(vertexData);
    vertexDataState.setIndices(indices);

    return vertexDataState;
  }
}

module.exports.Shader = Shader;
module.exports.BasicShader = BasicShader;