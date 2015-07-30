var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');

function BasicShader (window) {
    this.graphics = window.graphics;

    this.shaderProgram = new ShaderProgram(
        window.graphics, module.path + 'assets/shaders/basic');

    this.shaderProgram.projection = mat4.perspective(mat4.create(),
        (Math.PI / 180) * 45, window.width/window.height, 1, 1000);

    this.shaderProgram.view = mat4.lookAt(mat4.create(),
        vec3.fromValues(0, 0, -5),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0));

    this.shaderProgram.world = mat4.create();
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

BasicShader.prototype.setWorld = function (value) {
    this.shaderProgram.world = value;
};

BasicShader.Vertex = function (options) {
    options = options || {};
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.color = options.color || { r: 1, g: 1, b: 1, a: 1 };
    this.textureCoordinates = options.textureCoordinates || { u: 0, v: 0 };
};

BasicShader.Vertex.declaration = function () {
    return [
        { attributeName: 'position', attributeType: 'vec3' },
        { attributeName: 'color', attributeType: 'vec4' },
        { attributeName: 'texcoords', attributeType: 'vec2' }
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
    this.vertices.push.apply(this.vertices, [
        // Position (x, y, z)
        vertex.position.x, vertex.position.y, vertex.position.z,
        // Color (r, g, b, a)
        vertex.color.r, vertex.color.g, vertex.color.b, vertex.color.a,
        // Texture coordinates (u, v)
        vertex.textureCoordinates.u, vertex.textureCoordinates.v
    ]);
};

BasicShader.VertexList.prototype.toArray = function () {
    return this.vertices;
};

module.exports.BasicShader = BasicShader;
