var Game = require('/../lib/game.js').Game;
var BasicShader = require('/../lib/shader.js').BasicShader;
var vec3 = require('/../lib/gl-matrix/vec3.js');

var game = new Game({
    width: 1024,
    height: 576,
    fullscreen: false
});

// Create the vertices that form the triangle.
var vertex1 = new BasicShader.Vertex({
    position: vec3.fromValues(0,1,0),
    color: { r: 1, g: 0, b: 0, a: 1 }
});
var vertex2 = new BasicShader.Vertex({
    position: vec3.fromValues(-1,-1,0),
    color: { r: 0, g: 1, b: 0, a: 1 }
});
var vertex3 = new BasicShader.Vertex({
    position: vec3.fromValues(1,-1,0),
    color: { r: 0, g: 0, b: 1, a: 1 }
});

// Create the vertex list with the specified vertices.
var vertices = new BasicShader.VertexList([ vertex1, vertex2, vertex3 ]);

// Create the basic shader with the window for the game.
var basicShader = new BasicShader(game.window);

// Create the vertex data state used for storing the triangle vertices.
var vertexDataState = new VertexDataState(game.graphics);

vertexDataState.setVertexDeclaration(BasicShader.Vertex.declaration(),
    basicShader.shaderProgram);

// Set the vertices for the buffer.
vertexDataState.setVertices(vertices.toArray(), 'static');

// Set the vertex data state and shader program for the graphics.
game.graphics.setVertexDataState(vertexDataState);
game.graphics.setShaderProgram(basicShader.shaderProgram);

game.draw = function () {
    game.graphics.drawPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: 1
    });
};

game.run();