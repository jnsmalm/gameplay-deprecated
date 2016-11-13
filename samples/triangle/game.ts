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

let window = new Window({
    fullscreen: true
});

// Create a vertex specification that has position and color
let vertexSpecification = new VertexSpecification(
    window.graphics, ["vec3", "vec3"]);

// Create array of vertex data (x, y, z, r, g, b)
let vertices = [
    // Vertex 1
    -0.6, -0.8, 0, 0, 0, 1,
    // Vertex 2
    0.6, -0.8, 0, 0, 1, 0,
    // Vertex 3
    0, 0.8, 0, 1, 0, 0,
];
vertexSpecification.setVertexData(new Float32Array(vertices), "static");

// Create shader program from the "shader" folder
let shader = new ShaderProgram(window.graphics, "shader");

// Vertex specification and shader needs to be set before drawing
window.graphics.setVertexSpecification(vertexSpecification);
window.graphics.setShaderProgram(shader);

let keyboard = new Keyboard(window);

while (!window.isClosing()) {
    if (keyboard.isKeyDown(256)) {
        // Close window when pressing the escape key
        window.close();
    }
    window.pollEvents();
    window.graphics.clear("default", { r: 0.3, g: 0.3, b: 0.3, a: 1 });
    window.graphics.drawPrimitives({
        primitiveType: "triangleList",
        vertexStart: 0,
        primitiveCount: 1
    });
    window.graphics.present();
}