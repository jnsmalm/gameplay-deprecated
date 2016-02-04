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

var Transform = require('/transform.js').Transform;
var Camera = require('/camera.js').Camera;
var DirectionalLight = require('/light.js').DirectionalLight;
var Color = require('/color.js').Color;
var Vector2 = require('/math.js').Vector2;
var Vector3 = require('/math.js').Vector3;
var Vector4 = require('/math.js').Vector4;
var Matrix = require('/math.js').Matrix;

var _camera;
var _graphics;
var _shader;
var _lights = [
  new DirectionalLight(new Vector3(0,0,1))
];

var _vector3 = new Vector3();
var _vector4 = new Vector4();

class Mesh {
  constructor(geometry) {
    this.geometry = geometry;
    this.vertexDataState = createVertexDataState(geometry);
    this.transform = new Transform();
    this.material = new Material();
  }
}

class Material {
  constructor() {
    this.texture = null;
    this.shininess = 0.1;
    this.specular = Color.white();
    this.color = Color.white();
  }
}

class Model {
  constructor() {
    if (!_graphics) {
      throw new TypeError('Model has not been initialized.');
    }
    this.transform = new Transform();
    this.meshes = [];
  }

  draw() {
    for (var i=0; i<this.meshes.length; i++) {
      setupShader(this.meshes[i]);
      drawMesh(this.meshes[i]);
    };
  }

  static get camera() {
    return _camera;
  }

  static set camera(value) {
    _camera = value;
  }

  static get lights() {
    return _lights;
  }

  static set lights(value) {
    _lights = value;
  }

  static init(window) {
    _camera = new Camera({ window: window });
    _graphics = window.graphics;
    _shader = new ShaderProgram(
      _graphics, module.path + 'assets/shaders/basic');
  }

  static updateCameraAndLights() {
    updateShaderCamera();
    updateShaderLights();
  }

  static box() {
    return Model.load(module.path + 'assets/models/box.json');
  }

  static sphere() {
    return Model.load(module.path + 'assets/models/sphere.json');
  }

  static load(filepath) {
    return new Assimp(filepath).model;
  }
}

class Assimp {
  constructor(filepath) {
    this.data = JSON.parse(file.readText(filepath));
    this.model = new Model();
    this.path = filepath.replace(/[^\/]*$/, '');
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
      uv: this.readTextureCoords(this.data.meshes[i]),
      faces: this.readFaces(this.data.meshes[i])
    };
    var mesh = new Mesh(geometry);
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
    var normals = [];
    for (var i=0; i<mesh.normals.length; i+=3) {
      var x = mesh.normals[i+0];
      var y = mesh.normals[i+1];
      var z = mesh.normals[i+2];
      normals.push(new Vector3(x, y, z));
    };
    return normals;
  }

  readTextureCoords(mesh) {
    if (!mesh.texturecoords) {
      return [];
    }
    var texturecoords = [];
    // For now we just read the first texture channel.
    for (var i = 0; i < mesh.texturecoords[0].length; i+=2) {
      var u = mesh.texturecoords[0][i+0];
      var v = mesh.texturecoords[0][i+1];
      texturecoords.push(new Vector2(u, 1-v));
    };
    return texturecoords;
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

  readMaterial(mesh) {
    var result = new Material();
    var material = this.data.materials[mesh.materialindex];
    var props = {};
    for (var i=0; i<material.properties.length; i++) {
      var prop = material.properties[i];
      props[prop.key] = prop.value;
    }
    if (props['$clr.diffuse']) {
      var clr = props['$clr.diffuse'];
      result.color = new Color(clr[0], clr[1], clr[2], clr[3]);
    }
    if (props['$clr.specular']) {
      var clr = props['$clr.specular'];
      result.specular = new Color(clr[0], clr[1], clr[2], 1);
    }
    if (props['$mat.shininess']) {
      result.shininess = props['$mat.shininess'];
    }
    if (props['$tex.file']) {
      result.texture = new Texture2D(this.path + props['$tex.file']);
    }
    return result;
  }
}

function updateShaderCamera() {
  _shader.projection = _camera.projection;
  _shader.view = _camera.view;
  _shader.cameraPosition = _camera.transform.position;
}

function updateShaderLights() {
  _shader.numLights = _lights.length;
  for (var i=0; i<_lights.length; i++) {
    for (var j=0; j<3; j++) {
      _vector4[j] = _lights[i].transform.position[j];
    }
    if (_lights[i] instanceof DirectionalLight) {
      // When it's a directional light it doesn't have a position, we tell 
      // this to the shader by setting the w-value to zero.
      _vector4[3] = 0;
    } else {
      _vector4[3] = 1;
    }
    setLightUniform(i, 'position', _vector4);
    setLightUniform(i, 'ambientCoefficient', _lights[i].ambientCoefficient);
    setLightUniform(i, 'attenuation', _lights[i].attenuation);
    setLightUniform(i, 'intensities', _vector3.set(_lights[i].color));
    if (_lights[i].coneAngle) {
      setLightUniform(i, 'coneAngle', _lights[i].coneAngle);
    }
    if (_lights[i].coneDirection) {
      setLightUniform(i, 'coneDirection', _lights[i].coneDirection);
    }
  }
}

function setLightUniform(index, name, value) {
  _shader['allLights[' + index + '].' + name] = value;
}

function createVertexDataState(geometry) {
  var vertexDeclaration = [
    { name: 'vert', type: 'vec3' },
    { name: 'vertTexCoord', type: 'vec2' },
    { name: 'vertNormal', type: 'vec3' }
  ];
  var vertexDataState = new VertexDataState(_graphics);
  vertexDataState.setVertexDeclaration(vertexDeclaration, _shader);

  var vertices = new NumberArray();
  for (var i=0; i<geometry.vertices.length; i++) {
    vertices.push(geometry.vertices[i][0]);
    vertices.push(geometry.vertices[i][1]);
    vertices.push(geometry.vertices[i][2]);
    if (geometry.uv.length !== 0) {
      vertices.push(geometry.uv[i][0]);
      vertices.push(geometry.uv[i][1]);
    } else {
      // Even when the texture coordinates isn't available, the vertex data 
      // needs to be filled.
      vertices.push(0);
      vertices.push(0);
    }
    vertices.push(geometry.normals[i][0]);
    vertices.push(geometry.normals[i][1]);
    vertices.push(geometry.normals[i][2]);
  }

  var indices = new NumberArray();
  for (var i=0; i<geometry.faces.length; i++) {
    indices.push(geometry.faces[i]);
  }

  vertexDataState.setVertices(vertices);
  vertexDataState.setIndices(indices);

  return vertexDataState;
}

function setupShader(mesh) {
  _shader.model = mesh.transform.world;
  _shader.materialColor = _vector3.set(mesh.material.color);
  //_shader.materialSpecularColor = _vector3.set(mesh.specular);
  _shader.materialShininess = mesh.material.shininess;
  if (mesh.material.texture) {
    _shader.materialTextureEnabled = 1.1;
    _graphics.textures[0] = mesh.material.texture;
  } else {
    _shader.materialTextureEnabled = 0;
  }
}

function drawMesh(mesh) {
  _graphics.setShaderProgram(_shader);
  _graphics.setVertexDataState(mesh.vertexDataState);
  _graphics.drawIndexedPrimitives({
    primitiveType: 'triangleList',
    vertexStart: 0,
    primitiveCount: mesh.geometry.faces.length / 3
  });
}

module.exports.Model = Model;