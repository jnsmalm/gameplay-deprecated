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
const transform_1 = require("./transform");
const utils_1 = require("./utils");
let matrix = new utils_1.Pool(math_1.Matrix4, 5);
class Mesh {
    /***
     * Creates a new mesh with given geometry.
     */
    constructor(geometry, material, shader, transform = new transform_1.Transform()) {
        this.geometry = geometry;
        this.material = material;
        this.transform = transform;
        this.vertexSpecification = shader.createVertexSpecification(geometry);
    }
}
exports.Mesh = Mesh;
class Model {
    /**
     * Creates a new model.
     */
    constructor(meshes, shader, transform = new transform_1.Transform()) {
        this.meshes = meshes;
        this.shader = shader;
        this.transform = transform;
    }
    /**
     * Attaches the model to a transform.
     */
    attach(transform) {
        this.transform.parent = transform;
    }
    /**
     * Draws the model.
     */
    draw() {
        let graphics = this.shader.graphics;
        graphics.setShaderProgram(this.shader.program);
        for (let mesh of this.meshes) {
            this.shader.setMaterial(mesh.material);
            this.shader.setWorld(mesh.transform.getWorldMatrix(matrix.next));
            graphics.setVertexSpecification(mesh.vertexSpecification);
            graphics.drawIndexedPrimitives({
                primitiveType: 'triangleList',
                primitiveCount: mesh.geometry.indicies.length / 3
            });
        }
    }
    /**
     * Loads a model from file with the given shader.
     */
    static load(filepath, shader) {
        let data = JSON.parse(file.readText(filepath));
        let initial = AssimpReader.readTransformation(data.rootnode.transformation);
        let transform = new transform_1.Transform(initial);
        let reader = new AssimpReader(filepath.replace(/[^\/]*$/, ''), data, shader);
        let meshes = reader.readNodeHierarchy(data.rootnode, transform);
        return new Model(meshes, shader, transform);
    }
    /**
     * Creates a box model with given shader.
     */
    static createBox(shader) {
        return Model.load(module.path + "/content/models/box.json", shader);
    }
    /**
     * Creates a sphere model with given shader.
     */
    static createSphere(shader) {
        return Model.load(module.path + "/content/models/sphere.json", shader);
    }
}
exports.Model = Model;
class AssimpReader {
    /**
     * Creates a new assimp reader.
     */
    constructor(path, data, shader) {
        this.path = path;
        this.data = data;
        this.shader = shader;
        this.textures = {};
    }
    /**
     * Reads a transformation matrix array.
     */
    static readTransformation(transformation) {
        let matrix = new math_1.Matrix4();
        for (var i = 0; i < 16; i++) {
            matrix[i] = transformation[i];
        }
        return matrix.transpose(matrix);
    }
    /**
     * Reads the node hierarchy.
     */
    readNodeHierarchy(node, parentTransform) {
        let result = [];
        if (node.meshes) {
            for (var i = 0; i < node.meshes.length; i++) {
                let mesh = this.readMesh(this.data.meshes[node.meshes[i]], node.transformation);
                mesh.transform.parent = parentTransform;
                parentTransform = mesh.transform;
                result.push(mesh);
            }
        }
        else {
            // There are no meshes in this node, but we still need to add the 
            // node's transformation matrix to the hierarchy.
            let initial = AssimpReader.readTransformation(node.transformation);
            let transform = new transform_1.Transform(initial, parentTransform);
            parentTransform = transform;
        }
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                let meshes = this.readNodeHierarchy(node.children[i], parentTransform);
                result.push(...meshes);
            }
        }
        return result;
    }
    readMesh(mesh, transformation) {
        let geometry = this.readGeometry(mesh);
        let material = this.readMaterial(this.data.materials[mesh.materialindex]);
        let initial = AssimpReader.readTransformation(transformation);
        let transform = new transform_1.Transform(initial);
        return new Mesh(geometry, material, this.shader, transform);
    }
    /**
     * Reads the geometry for an assimp mesh.
     */
    readGeometry(mesh) {
        let geometry = {
            vertices: [],
            indicies: []
        };
        for (var i = 0; i < mesh.vertices.length; i += 3) {
            let uv = new math_1.Vector2();
            if (mesh.texturecoords) {
                uv.x = mesh.texturecoords[0][i * 2 + 0];
                uv.y = 1 - mesh.texturecoords[0][i * 2 + 1];
            }
            geometry.vertices.push({
                position: new math_1.Vector3(mesh.vertices[i + 0], mesh.vertices[i + 1], mesh.vertices[i + 2]),
                textureCoordinate: uv,
                normal: new math_1.Vector3(mesh.normals[i + 0], mesh.normals[i + 1], mesh.normals[i + 2])
            });
        }
        for (var i = 0; i < mesh.faces.length; i++) {
            geometry.indicies.push(mesh.faces[i][0], mesh.faces[i][1], mesh.faces[i][2]);
        }
        return geometry;
    }
    /**
     * Reads the material for an assimp mesh.
     */
    readMaterial(material) {
        let result = {
            ambient: null,
            diffuse: null,
            diffuseMap: null,
            shininess: 0
        };
        for (let i = 0; i < material.properties.length; i++) {
            let value = material.properties[i].value;
            switch (material.properties[i].key) {
                case "$clr.diffuse": {
                    result.diffuse = new math_1.Vector3(value[0], value[1], value[2]);
                    break;
                }
                case "$mat.shininess": {
                    result.shininess = value;
                    break;
                }
                case "$clr.ambient": {
                    result.ambient = new math_1.Vector3(value[0], value[1], value[2]);
                    break;
                }
                case "$tex.file": {
                    if (!this.textures[value]) {
                        this.textures[value] = new Texture2D(this.path + value);
                    }
                    switch (material.properties[i].semantic) {
                        case 1: {
                            result.diffuseMap = this.textures[value];
                        }
                    }
                    break;
                }
            }
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FvQlc7O0FBR1gsaUNBQWtEO0FBQ2xELDJDQUF3QztBQUN4QyxtQ0FBK0I7QUFFL0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxZQUFJLENBQUMsY0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBK0JsQztJQUVJOztPQUVHO0lBQ0gsWUFBbUIsUUFBa0IsRUFBUyxRQUFrQixFQUM1RCxNQUFjLEVBQVMsWUFBWSxJQUFJLHFCQUFTLEVBQUU7UUFEbkMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDckMsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFDbEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRSxDQUFDO0NBQ0o7QUFURCxvQkFTQztBQUVEO0lBQ0k7O09BRUc7SUFDSCxZQUFtQixNQUFjLEVBQVMsTUFBYyxFQUM3QyxZQUFZLElBQUkscUJBQVMsRUFBRTtRQURuQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUM3QyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtJQUFJLENBQUM7SUFDM0M7O09BRUc7SUFDSCxNQUFNLENBQUMsU0FBb0I7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0lBQ3RDLENBQUM7SUFDRDs7T0FFRztJQUNILElBQUk7UUFDQSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNwQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLENB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