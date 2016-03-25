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

#include <script/scripthelper.h>
#include <script/script-engine.h>
#include <utils/number-array.h>
#include "vertex-data-state.h"
#include "graphics-device.h"

using namespace v8;

namespace {

void SetVertices(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto array = helper.GetObject<NumberArray>(args[0]);
    GLfloat* vertices = new GLfloat[array->Length()];
    array->copy<GLfloat>(vertices);

    try {
        auto usage = helper.GetString(args[1], "static");
        BufferUsage bufferUsage;
        if (usage == "static") {
            bufferUsage = BufferUsage::Static;
        }
        else if (usage == "dynamic") {
            bufferUsage = BufferUsage::Dynamic;
        }
        else if (usage == "stream") {
            bufferUsage = BufferUsage::Stream;
        }
        else {
            throw std::runtime_error(
                    "Can't set vertices with usage '" + usage + "'.");
        }
        auto self = helper.GetObject<VertexDataState>(args.Holder());
        self->SetVertices(vertices, sizeof(float) * array->Length(),
                          bufferUsage);
        delete[] vertices;
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }
}

void SetIndices(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto array = helper.GetObject<NumberArray>(args[0]);
    int* indices = new int[array->Length()];
    array->copy<int>(indices);

    try {
        auto usage = helper.GetString(args[1], "static");
        BufferUsage bufferUsage;
        if (usage == "static") {
            bufferUsage = BufferUsage::Static;
        }
        else if (usage == "dynamic") {
            bufferUsage = BufferUsage::Dynamic;
        }
        else if (usage == "stream") {
            bufferUsage = BufferUsage::Stream;
        }
        else {
            throw std::runtime_error(
                    "Can't set elements with usage '" + usage + "'.");
        }
        auto self = helper.GetObject<VertexDataState>(args.Holder());
        self->SetIndices(indices, sizeof(int) * array->Length(),
                          bufferUsage);
        delete[] indices;
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }
}

GLenum GetGLUsage(BufferUsage usage) {
    switch (usage) {
        case BufferUsage::Static: return GL_STATIC_DRAW;
        case BufferUsage::Dynamic: return GL_DYNAMIC_DRAW;
        case BufferUsage::Stream: return GL_STREAM_DRAW;
    }
}

}

VertexDataState::VertexDataState(
        v8::Isolate *isolate, GraphicsDevice* graphicsDevice,
        std::vector<VertexElement> elements) :
        ScriptObjectWrap(isolate), graphicsDevice_(graphicsDevice) {

    // A Vertex Array Object (VAO) is an OpenGL Object that stores all of the
    // state needed to supply vertex data. It stores the format of the vertex
    // data as well as the Buffer Objects providing the vertex data arrays.

    glGenVertexArrays(1, &glVertexArray_);
    glBindVertexArray(glVertexArray_);
    glGenBuffers(1, &glVertexBuffer_);
    glGenBuffers(1, &glElementBuffer_);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, glElementBuffer_);
    glBindBuffer(GL_ARRAY_BUFFER, glVertexBuffer_);
    SetupVertexDeclaration(elements);
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

void VertexDataState::SetIndices(
        int *indices, size_t size, BufferUsage usage) {

    auto old = graphicsDevice_->vertexDataState();
    graphicsDevice_->SetVertexDataState(nullptr);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, glElementBuffer_);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, static_cast<GLsizeiptr>(size),
                 indices, GetGLUsage(usage));
    graphicsDevice_->SetVertexDataState(old);
}

void VertexDataState::SetupVertexDeclaration(
        std::vector<VertexElement> elements) {

    int stride = 0;
    for (auto element : elements) {
        stride += element.offset;
    }
    int location = 0;
    int offset = 0;
    for (auto element : elements) {
        glEnableVertexAttribArray(location);
        glVertexAttribPointer(location, element.size, GL_FLOAT, GL_FALSE,
                              stride, (GLvoid *)offset);
        offset += element.offset;
        location++;
    }
}

void VertexDataState::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("setVertices", ::SetVertices);
    SetFunction("setIndices", ::SetIndices);
}

void VertexDataState::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto graphicsDevice = helper.GetObject<GraphicsDevice>(args[0]);
    Handle<Array> array = Handle<Array>::Cast(args[1]);

    try {
        auto elements = std::vector<VertexElement>();
        for (uint32_t i = 0; i < array->Length(); i++) {
            auto type = helper.GetString(array->Get(i));
            if (type == "float") {
                elements.push_back(VertexElement { 1, 4 });
            }
            else if (type == "vec2") {
                elements.push_back(VertexElement { 2, 8 });
            }
            else if (type == "vec3") {
                elements.push_back(VertexElement { 3, 12 });
            }
            else if (type == "vec4") {
                elements.push_back(VertexElement { 4, 16 });
            }
            else if (type == "mat4") {
                elements.push_back(VertexElement { 16, 64 });
            }
            else {
                throw std::runtime_error(
                        "Can't set vertex declaration type to '" + type + "'.");
            }
        }
        auto vertexDataState = new VertexDataState(
                args.GetIsolate(), graphicsDevice, elements);
        args.GetReturnValue().Set(vertexDataState->v8Object());
    }
    catch (std::exception &err) {
        ScriptEngine::current().ThrowTypeError(err.what());
    }
}