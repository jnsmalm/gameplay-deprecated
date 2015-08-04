/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

#include <script/scripthelper.h>
#include <script/script-engine.h>
#include "vertex-data-state.h"
#include "graphics-device.h"

using namespace v8;

namespace {

void SetVertices(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    Handle<Array> array = Handle<Array>::Cast(args[0]);
    float *vertices = new float[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
        vertices[i] = (float) array->Get(i)->NumberValue();
    }

    try {
        auto usage = helper.GetString(args[1], "static");
        BufferUsage bufferUsage;
        if (usage == "static") {
            bufferUsage = BufferUsage::Static;
        }
        else if (usage == "dynamic") {
            bufferUsage = BufferUsage::Dynamic;
        }
        else {
            throw std::runtime_error(
                    "Can't set vertices with usage '" + usage + "'.");
        }
        auto self = helper.GetObject<VertexDataState>(args.Holder());
        self->SetVertices(vertices, sizeof(float) * array->Length(),
                          bufferUsage);
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }

    delete[] vertices;
}

void SetElements(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    Handle<Array> array = Handle<Array>::Cast(args[0]);
    int *vertices = new int[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
        vertices[i] = (int) array->Get(i)->NumberValue();
    }

    try {
        auto usage = helper.GetString(args[1], "static");
        BufferUsage bufferUsage;
        if (usage == "static") {
            bufferUsage = BufferUsage::Static;
        }
        else if (usage == "dynamic") {
            bufferUsage = BufferUsage::Dynamic;
        }
        else {
            throw std::runtime_error(
                    "Can't set elements with usage '" + usage + "'.");
        }
        auto self = helper.GetObject<VertexDataState>(args.Holder());
        self->SetElements(vertices, sizeof(int) * array->Length(),
                          bufferUsage);
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }

    delete[] vertices;
}

void SetVertexDeclaration(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    Handle<Array> array = Handle<Array>::Cast(args[0]);
    auto vertexDeclaration = new VertexDeclaration();

    try {
        for (int i = 0; i < array->Length(); i++) {
            auto obj = array->Get(i)->ToObject();
            auto name = helper.GetString(obj, "name");
            auto type = helper.GetString(obj, "type");
            if (type == "float") {
                vertexDeclaration->AddElement(name, 1, 4);
            }
            else if (type == "vec2") {
                vertexDeclaration->AddElement(name, 2, 8);
            }
            else if (type == "vec3") {
                vertexDeclaration->AddElement(name, 3, 12);
            }
            else if (type == "vec4") {
                vertexDeclaration->AddElement(name, 4, 16);
            }
            else {
                throw std::runtime_error(
                        "Can't set vertex declaration type to '" + type + "'.");
            }
        }
        auto shaderProgram = helper.GetObject<ShaderProgram>(args[1]);
        auto self = helper.GetObject<VertexDataState>(args.Holder());
        self->SetVertexDeclaration(vertexDeclaration, shaderProgram);
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }
}

GLenum GetGLUsage(BufferUsage usage) {
    switch (usage) {
        case BufferUsage::Static: return GL_STATIC_DRAW;
        case BufferUsage::Dynamic: return GL_DYNAMIC_DRAW;
        default: return GL_STATIC_DRAW;
    }
}

}

VertexDataState::VertexDataState(
        v8::Isolate *isolate, GraphicsDevice* graphicsDevice)
        : ScriptObjectWrap(isolate), graphicsDevice_(graphicsDevice) {

    // A Vertex Array Object (VAO) is an OpenGL Object that stores all of the
    // state needed to supply vertex data. It stores the format of the vertex
    // data as well as the Buffer Objects providing the vertex data arrays.

    glGenVertexArrays(1, &glVertexArray_);
    glBindVertexArray(glVertexArray_);
    glGenBuffers(1, &glVertexBuffer_);
    glGenBuffers(1, &glElementBuffer_);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, glElementBuffer_);
    glBindVertexArray(0);
}

VertexDataState::~VertexDataState() {
    glDeleteVertexArrays(1, &glVertexArray_);
    glDeleteBuffers(1, &glVertexBuffer_);
    glDeleteBuffers(1, &glElementBuffer_);
}

void VertexDataState::SetVertices(
        float *vertices, size_t size, BufferUsage usage) {

    auto old = graphicsDevice_->vertexDataState();
    graphicsDevice_->SetVertexDataState(nullptr);
    glBindBuffer(GL_ARRAY_BUFFER, glVertexBuffer_);
    glBufferData(GL_ARRAY_BUFFER, static_cast<GLsizeiptr>(size),
                 vertices, GetGLUsage(usage));
    graphicsDevice_->SetVertexDataState(old);
}

void VertexDataState::SetElements(
        int *indices, size_t size, BufferUsage usage) {

    auto old = graphicsDevice_->vertexDataState();
    graphicsDevice_->SetVertexDataState(nullptr);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, glElementBuffer_);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, static_cast<GLsizeiptr>(size),
                 indices, GetGLUsage(usage));
    graphicsDevice_->SetVertexDataState(old);
}

void VertexDataState::SetVertexDeclaration(
        VertexDeclaration *declaration, ShaderProgram *program) {

    auto old = graphicsDevice_->vertexDataState();
    graphicsDevice_->SetVertexDataState(this);
    glBindBuffer(GL_ARRAY_BUFFER, glVertexBuffer_);
    declaration->Setup(program);
    graphicsDevice_->SetVertexDataState(old);
}

void VertexDataState::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("setVertices", ::SetVertices);
    SetFunction("setElements", ::SetElements);
    SetFunction("setVertexDeclaration", ::SetVertexDeclaration);
}

void VertexDataState::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto graphicsDevice = helper.GetObject<GraphicsDevice>(args[0]);
    auto vertexDataState = new VertexDataState(
            args.GetIsolate(), graphicsDevice);
    args.GetReturnValue().Set(vertexDataState->v8Object());
}