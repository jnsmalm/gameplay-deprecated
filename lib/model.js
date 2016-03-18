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

var Transform = require('./transform.js').Transform;
var Vector2 = require('./math.js').Vector2;
var Vector3 = require('./math.js').Vector3;

class Model {
  constructor() {
    this.transform = new Transform();
    this.meshes = [];
  }

  draw() {
    for (var i=0; i<this.meshes.length; i++) {
      this.meshes[i].draw();
    }
  }

  static box(shader) {
    return Model.load(module.path + '/assets/models/box.json', shader);
  }

  static sphere(shader) {
    return Model.load(module.path + '/assets/models/sphere.json', shader);
  }

  static load(filepath, shader) {
    return new AssimpLoader(filepath, shader).model;
  }
}

class Mesh {
  constructor(geometry, shader) {
    this.geometry = geometry;
    this.vertexDataState = shader.createVertexDataState(geometry);
    this.transform = new Transform();
    this.material = new Material();
    this.shader = shader;
    this.graphics = shader.graphics;
  }

  draw() {
    this.shader.model = this.transform.world;
    this.shader.material = this.material;

    this.graphics.setShaderProgram(this.shader.program);
    this.graphics.setVertexDataState(this.vertexDataState);

    this.graphics.drawIndexedPrimitives({
      primitiveType: 'triangleList',
      vertexStart: 0,
      primitiveCount: this.geometry.faces.length / 3
    });
  }
}

class Material {
  constructor() {
    this.diffuse = new Vector3(1,1,1);
    this.diffuseMap = null;
    this.specular = new Vector3(0.5,0.5,0.5);
    this.specularMap = null;
    this.shininess = 10;
    this.heightMap = null;
    this.normalMap = null;
  }
}

class AssimpLoader {
  constructor(filepath, shader) {
    this.data = JSON.parse(file.readText(filepath));
    this.model = new Model();
    this.path = filepath.replace(/[^\/]*$/, '');
    this.textures = {};
    this.shader = shader;
    this.readNodeHierarchy(this.data.rootnode, this.model.transform);
  }

  readNodeHierarchy(node, parentTransform) {
    if (node.meshes) {
      for (var i=0; i<node.meshes.length; i++) {
        var mesh = this.readMesh(node.meshes[i]);
        // Copy the node's transformation matrix
        for (var j=0; j<16; j++) {
          mesh.transform[j] = node.transformation[j];
        }
        mesh.transform.parent = parentTransform;
        parentTransform = mesh.transform;
        this.model.meshes.push(mesh);
      }
    } else {
      // There are no meshes in this node, but we still need to add the node's
      // transformation matrix to the hierarchy.
      var transform = new Transform();
      for (var i=0; i<16; i++) {
        transform[i] = node.transformation[i];
      }
      transform.parent = parentTransform;
      parentTransform = transform;
    }
    if (node.children) {
      for (var i=0; i<node.children.length; i++) {
        this.readNodeHierarchy(node.children[i], parentTransform);
      }
    }
  }

  readMesh(i) {
    var geometry = {
      vertices: this.readVertices(this.data.meshes[i]),
      normals: this.readNormals(this.data.meshes[i]),
      texCoords: this.readTexCoords(this.data.meshes[i]),
      faces: this.readFaces(this.data.meshes[i]),
      tangents: this.readTangents(this.data.meshes[i]),
      bitangents: this.readBitangents(this.data.meshes[i])
    };
    var mesh = new Mesh(geometry, this.shader);
    mesh.material = this.readMaterial(this.data.meshes[i]);
    return mesh;
  }

  readVertices(mesh) {
    var vertices = [];
    for (var i=0; i<mesh.vertices.length; i+=3) {
      var x = mesh.vertices[i+0];
      var y = mesh.vertices[i+1];
      var z = mesh.vertices[i+2];
      vertices.push(new Vector3(x, y, z));
    };
    return vertices;
  }

  readNormals(mesh) {
    if (!mesh.normals) {
      return null;
    }
    var normals = [];
    for (var i=0; i<mesh.normals.length; i+=3) {
      var x = mesh.normals[i+0];
      var y = mesh.normals[i+1];
      var z = mesh.normals[i+2];
      normals.push(new Vector3(x, y, z));
    };
    return normals;
  }

  readTangents(mesh) {
    if (!mesh.tangents) {
      return null;
    }
    var tangents = [];
    for (var i=0; i<mesh.tangents.length; i+=3) {
      var x = mesh.tangents[i+0];
      var y = mesh.tangents[i+1];
      var z = mesh.tangents[i+2];
      tangents.push(new Vector3(x, y, z));
    };
    return tangents;
  }

  readBitangents(mesh) {
    if (!mesh.bitangents) {
      return null;
    }
    var bitangents = [];
    for (var i=0; i<mesh.bitangents.length; i+=3) {
      var x = mesh.bitangents[i+0];
      var y = mesh.bitangents[i+1];
      var z = mesh.bitangents[i+2];
      bitangents.push(new Vector3(x, y, z));
    };
    return bitangents;
  }

  readTexCoords(mesh) {
    if (!mesh.texturecoords) {
      return null;
    }
    var texCoords = [];
    // For now we just read the first texture channel.
    for (var i = 0; i < mesh.texturecoords[0].length; i+=2) {
      var u = mesh.texturecoords[0][i+0];
      var v = mesh.texturecoords[0][i+1];
      texCoords.push(new Vector2(u, 1-v));
    };
    return texCoords;
  }

  readFaces(mesh) {
    var faces = [];
    for (var i = 0; i < mesh.faces.length; i++) {
      faces.push(mesh.faces[i][0]);
      faces.push(mesh.faces[i][1]);
      faces.push(mesh.faces[i][2]);
    }
    return faces;
  }

  readTexture(material, prop) {
    if (!this.textures[prop.value]) {
      this.textures[prop.value] = new Texture2D(this.path + prop.value);
    }
    switch (prop.semantic) {
      case 1: {
        material.diffuseMap = this.textures[prop.value];
        break;
      }
      case 2: {
        material.specularMap = this.textures[prop.value];
        break;
      }
      case 5: {
        material.heightMap = this.textures[prop.value];
        break;
      }
      case 6: {
        material.normalMap = this.textures[prop.value];
        break;
      }
    }
  }

  readVector(prop) {
    return new Vector3(prop.value[0], prop.value[1], prop.value[2]);
  }

  readMaterial(mesh) {
    var material = new Material();
    var props = this.data.materials[mesh.materialindex].properties;

    for (var i=0; i<props.length; i++) {
      switch (props[i].key) {
        case '$clr.diffuse': {
          material.diffuse = this.readVector(props[i]);
          break;
        }
        case '$clr.specular': {
          material.specular = this.readVector(props[i]);
          break;
        }
        case '$clr.shininess': {
          material.shininess = props[i].value;
          break;
        }
        case '$tex.file': {
          this.readTexture(material, props[i]);
          break;
        }
      }
    }
    return material;
  }
}

module.exports.Model = Model;