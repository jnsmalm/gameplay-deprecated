var mat4 = require('matrix.js').mat4;
var vec3 = require('vector.js').vec3;

function BasicShader (window) {
    this.graphics = window.graphics;

    this.shaderProgram = new ShaderProgram(
        window.graphics, 'lib/assets/shaders/basic');

    this.shaderProgram.projection = mat4.perspective(mat4.create(),
        (Math.PI / 180) * 45, window.width/window.height, 1, 1000);

    this.shaderProgram.view = mat4.lookAt(mat4.create(),
        vec3.fromValues(0, 0, -5),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0));

    this.shaderProgram.world = mat4.create();
}

BasicShader.prototype.setTexture = function (texture) {
    this.shaderProgram.textureEnabled = 1;
    this.graphics.textures[0] = texture;
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
        vertex.position.x, vertex.position.y, vertex.position.z,
        vertex.color.r, vertex.color.g, vertex.color.b, vertex.color.a,
        vertex.textureCoordinates.u, vertex.textureCoordinates.v
    ]);
};

BasicShader.VertexList.prototype.toArray = function () {
    return this.vertices;
};

module.exports.BasicShader = BasicShader;
