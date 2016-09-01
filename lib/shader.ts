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

import { Color } from './color'
import { Model, Shader, Vertex, Material, Geometry } from './model'
import { Vector2, Vector3, Matrix4 } from './math'

class BasicShaderLight {
    constructor(private program: ShaderProgram) {
        this.setAmbient(new Vector3(0.3, 0.3, 0.3));
        this.setDiffuse(new Vector3(1, 1, 1));
        this.setDirection(new Vector3(-1, -1, -1));
    }
    setAmbient(value: Vector3) { 
        this.program['light.ambient'] = value; 
    }
    setDiffuse(value: Vector3) { 
        this.program['light.diffuse'] = value; 
    }
    setDirection(value: Vector3) {
        this.program['light.direction'] = value;
    }
}

class BasicShaderMaterial {
    constructor(private graphics: Graphics, private program: ShaderProgram) {
    }
    setDiffuse(value: Vector3) {
        this.program['material.diffuse'] = value;
    }
    setDiffuseMap(value: Texture2D) { 
        if (value) {
            this.graphics.textures[0] = value;
            this.program['material.enableDiffuseMap'] = 1;
            this.program["material.diffuseMap"] = 0;
        } else {
            this.program['material.enableDiffuseMap'] = 0;
        }
    }
}

/** 
 * Represents a basic shader with a single light source.
 */
export class BasicShader implements Shader {
    public program: ShaderProgram;
    public light: BasicShaderLight;
    public material: BasicShaderMaterial;
    /** 
     * Creates a new basic shader.
     */
    constructor(public graphics: Graphics) {
        this.program = new ShaderProgram(
            graphics, module.path + "/content/shaders/basic");
        this.material = new BasicShaderMaterial(graphics, this.program);
        this.light = new BasicShaderLight(this.program);
    }
    /** 
     * Sets the world transformation matrix.
     */
    setWorld(value: Matrix4) { 
        this.program["model"] = value; 
    }
    /**
     * Sets the projection matrix.
     */
    setProjection(value: Matrix4) { 
        this.program["projection"] = value; 
    }
    /** 
     * Sets the view matrix.
     */
    setView(value: Matrix4) { 
        this.program["view"] = value; 
    }

    /** Sets the material. */
    setMaterial(material: Material) {
        this.material.setDiffuse(material.diffuse);
        this.material.setDiffuseMap(material.diffuseMap);
    }
    /** 
     * Creates a vertex specification with the given geometry.
     */
    createVertexSpecification(geometry: Geometry) {
        let vs = new VertexSpecification(
            this.graphics, ['vec3', 'vec3', 'vec2']);
        vs.setIndexData(new Int32Array(geometry.indicies), 'static');

        let vertices: number[] = [];
        for (var i = 0; i < geometry.vertices.length; i++) {
            vertices.push(
                geometry.vertices[i].position[0],
                geometry.vertices[i].position[1],
                geometry.vertices[i].position[2],
                geometry.vertices[i].normal[0],
                geometry.vertices[i].normal[1],
                geometry.vertices[i].normal[2],
                geometry.vertices[i].textureCoordinate[0],
                geometry.vertices[i].textureCoordinate[1]
            );
        }
        vs.setVertexData(new Float32Array(vertices), 'static');

        return vs;
    }
}