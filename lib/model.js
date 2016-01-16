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

var _camera;
var _graphics;
var _shader;
var _lights = [
  new DirectionalLight(new Vector3(0,0,1))
];

var _vector3 = new Vector3();
var _vector4 = new Vector4();

class Model {
  constructor(mesh) {
    if (!_graphics) {
      throw new TypeError('Model has not been initialized.');
    }
    this.mesh = mesh;
    this.transform = new Transform();
    this.texture = null;
    this.color = Color.white();
    this.shininess = 0.1;
    this.specular = Color.white();
    createVertexDataState(this);
  }

  draw() {
    setupShader(this);
    drawModel(this);
  }

  static get camera() {
    return _camera;
  }

  static set camera(value) {
    _camera = value;
  }

  static get lights() {
    return lights;
  }

  static set lights(value) {
    lights = value;
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
    return Model.load(module.path + '/models/box.json');
  }

  static sphere() {
    return Model.load(module.path + '/models/sphere.json');
  }

  static load(filepath) {
    var data = JSON.parse(file.readText(filepath));
    var models = [];

    for (var i=0; i<data.meshes.length; i++) {
      var mesh = new Mesh();
      mesh.vertices = readMeshVertices(data.meshes[i]);
      mesh.normals = readMeshNormals(data.meshes[i]);
      mesh.uv = readMeshTextureCoords(data.meshes[i]);
      mesh.faces = readMeshFaces(data.meshes[i]);
      var model = new Model(mesh);
      setModelMaterial(model, data.materials[data.meshes[i].materialindex]);
      models.push(model);
    }
    return models;
  }
}

class Mesh {
  constructor() {
    this.vertices = [];
    this.uv = [];
    this.normals = [];
    this.faces = [];
  }
}

function readMeshVertices(mesh) {
  var vertices = [];
  for (var i = 0; i < mesh.vertices.length; i+=3) {
    var x = mesh.vertices[i+0];
    var y = mesh.vertices[i+1];
    var z = mesh.vertices[i+2];
    vertices.push(new Vector3(x, y, z));
  };
  return vertices;
}

function readMeshNormals(mesh) {
  var normals = [];
  for (var i = 0; i < mesh.normals.length; i+=3) {
    var x = mesh.normals[i+0];
    var y = mesh.normals[i+1];
    var z = mesh.normals[i+2];
    normals.push(new Vector3(x, y, z));
  };
  return normals;
}

function readMeshTextureCoords(mesh) {
  if (!mesh.texturecoords) {
    return [];
  }
  var texturecoords = [];
  // Not sure why texturecoords is an array of an array.
  for (var i = 0; i < mesh.texturecoords[0].length; i+=2) {
    var u = mesh.texturecoords[0][i+0];
    var v = mesh.texturecoords[0][i+1];
    texturecoords.push(new Vector2(u, 1-v));
  };
  return texturecoords;
}

function readMeshFaces(mesh) {
  var faces = [];
  for (var i = 0; i < mesh.faces.length; i++) {
    faces.push(mesh.faces[i][0]);
    faces.push(mesh.faces[i][1]);
    faces.push(mesh.faces[i][2]);
  }
  return faces;
}

function setModelMaterial(model, material) {
  var mat = {};
  for (var i=0; i<material.properties.length; i++) {
    var prop = material.properties[i];
    mat[prop.key] = prop.value;
  }
  if (mat['$clr.diffuse']) {
    var clr = mat['$clr.diffuse'];
    model.color = new Color(clr[0], clr[1], clr[2], clr[3]);
  }
  if (mat['$clr.specular']) {
    var clr = mat['$clr.specular'];
    model.specular = new Color(clr[0], clr[1], clr[2], 1);
  }
  if (mat['$mat.shininess']) {
    model.shininess = mat['$mat.shininess'];
  }
  if (mat['$tex.file']) {
    model.texture = new Texture2D(mat['$tex.file']);
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

function createVertexDataState(model) {
  var vertexDeclaration = [
    { name: 'vert', type: 'vec3' },
    { name: 'vertTexCoord', type: 'vec2' },
    { name: 'vertNormal', type: 'vec3' }
  ];
  model.vertexDataState = new VertexDataState(_graphics);
  model.vertexDataState.setVertexDeclaration(vertexDeclaration, _shader);

  var vertices = new NumberArray();
  for (var i=0; i<model.mesh.vertices.length; i++) {
    vertices.push(model.mesh.vertices[i][0]);
    vertices.push(model.mesh.vertices[i][1]);
    vertices.push(model.mesh.vertices[i][2]);
    if (model.mesh.uv.length !== 0) {
      vertices.push(model.mesh.uv[i][0]);
      vertices.push(model.mesh.uv[i][1]);
    } else {
      // Even when the texture coordinates isn't available, the vertex data 
      // needs to be filled.
      vertices.push(0);
      vertices.push(0);
    }
    vertices.push(model.mesh.normals[i][0]);
    vertices.push(model.mesh.normals[i][1]);
    vertices.push(model.mesh.normals[i][2]);
  }

  var indices = new NumberArray();
  for (var i=0; i<model.mesh.faces.length; i++) {
    indices.push(model.mesh.faces[i]);
  }

  model.vertexDataState.setVertices(vertices);
  model.vertexDataState.setIndices(indices);
}

function setupShader(model) {
  _shader.model = model.transform.world;
  _shader.materialColor = _vector3.set(model.color);
  //_shader.materialSpecularColor = _vector3.set(model.specular);
  _shader.materialShininess = model.shininess;
  if (model.texture) {
    _shader.materialTextureEnabled = 1.1;
    _graphics.textures[0] = model.texture;
  } else {
    _shader.materialTextureEnabled = 0;
  }
}

function drawModel(model) {
  _graphics.setShaderProgram(_shader);
  _graphics.setVertexDataState(model.vertexDataState);
  _graphics.drawIndexedPrimitives({
    primitiveType: 'triangleList',
    vertexStart: 0,
    primitiveCount: model.mesh.faces.length / 3
  });
}

module.exports.Mesh = Mesh;
module.exports.Model = Model;