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

import { Color } from './color';
import { Vector2, Vector3, Matrix4 } from './math'
import { Transform } from './transform';
import { Pool } from './utils';

let matrix = new Pool(Matrix4, 5);

export interface Vertex {
    position: Vector3;
    textureCoordinate: Vector2;
    normal: Vector3;
}

export interface Geometry {
    vertices: Vertex[];
    indicies: number[];
}

export interface Material {
    ambient: Vector3;
    diffuse: Vector3;
    diffuseMap: Texture2D;
    shininess: number;
}

export interface Shader {
    graphics: Graphics;
    program: ShaderProgram;
    /**
     * Creates the vertex specification with given geometry.
     */
    createVertexSpecification(geometry: Geometry): VertexSpecification;
    setMaterial(material: Material): void;
    setWorld(world: Matrix4): void;
}

export class Mesh {
    public vertexSpecification: VertexSpecification;
    /***
     * Creates a new mesh with given geometry.
     */
    constructor(public geometry: Geometry, public material: Material,
        shader: Shader, public transform = new Transform()) {
        this.vertexSpecification = shader.createVertexSpecification(geometry);
    }
}

export class Model {
    /**
     * Creates a new model.
     */
    constructor(public meshes: Mesh[], public shader: Shader,
        public transform = new Transform()) { }
    /**
     * Attaches the model to a transform.
     */
    attach(transform: Transform) {
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
    static load(filepath: string, shader: Shader) {
        let data = <AssimpData>JSON.parse(file.readText(filepath));
        let initial = AssimpReader.readTransformation(
            data.rootnode.transformation);
        let transform = new Transform(initial);
        let reader = new AssimpReader(
            filepath.replace(/[^\/]*$/, ''), data, shader);
        let meshes = reader.readNodeHierarchy(data.rootnode, transform);
        return new Model(meshes, shader, transform);
    }
    /**
     * Creates a box model with given shader.
     */
    static createBox(shader: Shader) {
        return Model.load(module.path + "/content/models/box.json", shader);
    }
    /**
     * Creates a sphere model with given shader.
     */
    static createSphere(shader: Shader) {
        return Model.load(module.path + "/content/models/sphere.json", shader);
    }
}

interface AssimpTextures {
    [filepath: string]: Texture2D
}

class AssimpReader {
    private textures: AssimpTextures = {};
    /**
     * Creates a new assimp reader.
     */
    constructor(private path: string, private data: AssimpData,
        private shader: Shader) { }
    /**
     * Reads a transformation matrix array.
     */
    static readTransformation(transformation: number[]) {
        let matrix = new Matrix4();
        for (var i = 0; i < 16; i++) {
            matrix[i] = transformation[i];
        }
        return matrix.transpose(matrix);
    }
    /**
     * Reads the node hierarchy.
     */
    readNodeHierarchy(node: AssimpNode, parentTransform: Transform): Mesh[] {
        let result: Mesh[] = [];
        if (node.meshes) {
            for (var i = 0; i < node.meshes.length; i++) {
                let mesh = this.readMesh(
                    this.data.meshes[node.meshes[i]], node.transformation);
                mesh.transform.parent = parentTransform;
                parentTransform = mesh.transform;
                result.push(mesh);
            }
        } else {
            // There are no meshes in this node, but we still need to add the 
            // node's transformation matrix to the hierarchy.
            let initial = AssimpReader.readTransformation(node.transformation);
            let transform = new Transform(initial, parentTransform);
            parentTransform = transform;
        }
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                let meshes = this.readNodeHierarchy(
                    node.children[i], parentTransform);
                result.push(...meshes);
            }
        }
        return result;
    }

    readMesh(mesh: AssimpMesh, transformation: number[]): Mesh {
        let geometry = this.readGeometry(mesh);
        let material = this.readMaterial(
            this.data.materials[mesh.materialindex]);
        let initial = AssimpReader.readTransformation(transformation);
        let transform = new Transform(initial);
        return new Mesh(geometry, material, this.shader, transform);
    }
    /**
     * Reads the geometry for an assimp mesh.
     */
    readGeometry(mesh: AssimpMesh): Geometry {
        let geometry: Geometry = {
            vertices: [],
            indicies: []
        };
        for (var i = 0; i < mesh.vertices.length; i += 3) {
            let uv = new Vector2();
            if (mesh.texturecoords) {
                uv.x = mesh.texturecoords[0][i * 2 + 0];
                uv.y = 1 - mesh.texturecoords[0][i * 2 + 1];
            }
            geometry.vertices.push({
                position: new Vector3(
                    mesh.vertices[i + 0],
                    mesh.vertices[i + 1],
                    mesh.vertices[i + 2]),
                textureCoordinate: uv,
                normal: new Vector3(
                    mesh.normals[i + 0],
                    mesh.normals[i + 1],
                    mesh.normals[i + 2])
            });
        }
        for (var i = 0; i < mesh.faces.length; i++) {
            geometry.indicies.push(
                mesh.faces[i][0], mesh.faces[i][1], mesh.faces[i][2]);
        }
        return geometry;
    }
    /**
     * Reads the material for an assimp mesh.
     */
    readMaterial(material: AssimpMaterial): Material {
        let result: Material = {
            ambient: null,
            diffuse: null,
            diffuseMap: null,
            shininess: 0
        };
        for (let i = 0; i < material.properties.length; i++) {
            let value = material.properties[i].value
            switch (material.properties[i].key) {
                case "$clr.diffuse": {
                    result.diffuse = new Vector3(value[0], value[1], value[2]);
                    break;
                }
                case "$mat.shininess": {
                    result.shininess = value;
                    break;
                }
                case "$clr.ambient": {
                    result.ambient = new Vector3(value[0], value[1], value[2]);
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

declare interface AssimpData {
    materials: AssimpMaterial[];
    meshes: AssimpMesh[];
    rootnode: AssimpNode;
}

declare interface AssimpMesh {
    faces: [number[]];
    materialindex: number;
    name: string;
    texturecoords: Array<number[]>;
    normals: number[];
    vertices: number[];
}

declare interface AssimpMaterial {
    properties: [{
        key: string,
        semantic: number,
        index: number,
        type: number,
        value: any
    }]
}

declare interface AssimpNode {
    children?: AssimpNode[];
    meshes?: number[];
    name: string;
    transformation: number[];
}