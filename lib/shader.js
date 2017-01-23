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
"use strict";
const math_1 = require("./math");
class BasicShaderLight {
    constructor(program) {
        this.program = program;
        this.setAmbient(new math_1.Vector3(0.3, 0.3, 0.3));
        this.setDiffuse(new math_1.Vector3(1, 1, 1));
        this.setDirection(new math_1.Vector3(-1, -1, -1));
    }
    setAmbient(value) {
        this.program['light.ambient'] = value;
    }
    setDiffuse(value) {
        this.program['light.diffuse'] = value;
    }
    setDirection(value) {
        this.program['light.direction'] = value;
    }
}
class BasicShaderMaterial {
    constructor(graphics, program) {
        this.graphics = graphics;
        this.program = program;
    }
    setDiffuse(value) {
        this.program['material.diffuse'] = value;
    }
    setDiffuseMap(value) {
        if (value) {
            this.graphics.textures[0] = value;
            this.program['material.enableDiffuseMap'] = 1;
            this.program["material.diffuseMap"] = 0;
        }
        else {
            this.program['material.enableDiffuseMap'] = 0;
        }
    }
}
/**
 * Represents a basic shader with a single light source.
 */
class BasicShader {
    /**
     * Creates a new basic shader.
     */
    constructor(graphics) {
        this.graphics = graphics;
        this.program = new ShaderProgram(graphics, module.path + "/content/shaders/basic");
        this.material = new BasicShaderMaterial(graphics, this.program);
        this.light = new BasicShaderLight(this.program);
    }
    /**
     * Sets the world transformation matrix.
     */
    setWorld(value) {
        this.program["model"] = value;
    }
    /**
     * Sets the projection matrix.
     */
    setProjection(value) {
        this.program["projection"] = value;
    }
    /**
     * Sets the view matrix.
     */
    setView(value) {
        this.program["view"] = value;
    }
    /** Sets the material. */
    setMaterial(material) {
        this.material.setDiffuse(material.diffuse);
        this.material.setDiffuseMap(material.diffuseMap);
    }
    /**
     * Creates a vertex specification with the given geometry.
     */
    createVertexSpecification(geometry) {
        let vs = new VertexSpecification(this.graphics, ['vec3', 'vec3', 'vec2']);
        vs.setIndexData(new Int32Array(geometry.indicies), 'static');
        let vertices = [];
        for (var i = 0; i < geometry.vertices.length; i++) {
            vertices.push(geometry.vertices[i].position[0], geometry.vertices[i].position[1], geometry.vertices[i].position[2], geometry.vertices[i].normal[0], geometry.vertices[i].normal[1], geometry.vertices[i].normal[2], geometry.vertices[i].textureCoordinate[0], geometry.vertices[i].textureCoordinate[1]);
        }
        vs.setVertexData(new Float32Array(vertices), 'static');
        return vs;
    }
}
exports.BasicShader = BasicShader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFJWCxpQ0FBa0Q7QUFFbEQ7SUFDSSxZQUFvQixPQUFzQjtRQUF0QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxjQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxjQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxjQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxVQUFVLENBQUMsS0FBYztRQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBQ0QsVUFBVSxDQUFDLEtBQWM7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDMUMsQ0FBQztJQUNELFlBQVksQ0FBQyxLQUFjO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztDQUNKO0FBRUQ7SUFDSSxZQUFvQixRQUFrQixFQUFVLE9BQXNCO1FBQWxELGFBQVEsR0FBUixRQUFRLENBQVU7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFlO0lBQ3RFLENBQUM7SUFDRCxVQUFVLENBQUMsS0FBYztRQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzdDLENBQUM7SUFDRCxhQUFhLENBQUMsS0FBZ0I7UUFDMUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSDtJQUlJOztPQUVHO0lBQ0gsWUFBbUIsUUFBa0I7UUFBbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksYUFBYSxDQUM1QixRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLEtBQWM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsYUFBYSxDQUFDLEtBQWM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDdkMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLEtBQWM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixXQUFXLENBQUMsUUFBa0I7UUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCx5QkFBeUIsQ0FBQyxRQUFrQjtRQUN4QyxJQUFJLEVBQUUsR0FBRyxJQUFJLG1CQUFtQixDQUM1QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTdELElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQsUUFBUSxDQUFDLElBQUksQ0FDVCxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFDaEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQ2hDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUNoQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDOUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQzlCLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUM5QixRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUN6QyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUM1QyxDQUFDO1FBQ04sQ0FBQztRQUNELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdkQsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDSjtBQTlERCxrQ0E4REMifQ==