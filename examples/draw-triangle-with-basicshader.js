var Game = require('/../lib/game.js').Game;
var BasicShader = require('/../lib/shader.js').BasicShader;

var game = new Game({
    width: 1024,
    height: 576,
    fullscreen: false
});

// Create the vertices that form the triangle.
var vertex1 = new BasicShader.Vertex({
    position: { x: 0, y: 1, z: 0 },
    color: { r: 1, g: 0, b: 0, a: 1 }
});
var vertex2 = new BasicShader.Vertex({
    position: { x: -1, y: -1, z: 0 },
    color: { r: 0, g: 1, b: 0, a: 1 }
});
var vertex3 = new BasicShader.Vertex({
    position: { x: 1, y: -1, z: 0 },
    color: { r: 0, g: 0, b: 1, a: 1 }
});

// Create the vertex list with the specified vertices.
var vertices = new BasicShader.VertexList([ vertex1, vertex2, vertex3 ]);

// Create the vertex buffer used for storing the triangle vertices.
var vertexBuffer = new VertexBuffer(
    game.graphics, BasicShader.Vertex.declaration());

// Set the vertices for the buffer.
vertexBuffer.setData(vertices.toArray());

// Create the basic shader with the window for the game.
var basicShader = new BasicShader(game.window);

// Set the vertex buffer and shader program for the graphics.
game.graphics.setVertexBuffer(vertexBuffer);
game.graphics.setShaderProgram(basicShader.shaderProgram);

game.draw = function () {
    game.graphics.drawPrimitives({
        primitiveType: 'triangleList',
        vertexStart: 0,
        primitiveCount: 1
    });
};

game.run();