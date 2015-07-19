/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

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

#include <script/script-engine.h>
#include <script/scripthelper.h>
#include "vertex-buffer.h"
#include "window.h"
#include "vertex-declaration.h"
#include "graphics-device.h"

using namespace v8;

VertexBuffer::VertexBuffer(v8::Isolate* isolate, GraphicsDevice* graphicsDevice,
                           VertexDeclaration* vertexDeclaration)
        : ScriptObjectWrap(isolate), graphicsDevice_(graphicsDevice),
          vertexDeclaration_(vertexDeclaration) {
    Window::EnsureCurrentContext();
    glGenBuffers(1, &glVertexBuffer_);
    glGenVertexArrays(1, &glVertexArray_);
}

VertexBuffer::~VertexBuffer() {
    glDeleteVertexArrays(1, &glVertexArray_);
    glDeleteBuffers(1, &glVertexBuffer_);
}

void VertexBuffer::SetData(float *vertices, size_t size,
                           VertexBufferUsage usage) {
    auto vertexBuffer = graphicsDevice_->vertexBuffer();
    graphicsDevice_->SetVertexBuffer(this);
    glBindVertexArray(glVertexArray_);

    GLenum gl_usage;
    switch (usage) {
        case VertexBufferUsage::Static: {
            gl_usage = GL_STATIC_DRAW;
            break;
        }
        case VertexBufferUsage::Dynamic: {
            gl_usage = GL_DYNAMIC_DRAW;
            break;
        }
        default: {
            gl_usage = GL_STATIC_DRAW;
        }
    }
    glBufferData(GL_ARRAY_BUFFER, static_cast<GLsizeiptr>(size),
                 vertices, gl_usage);

    glBindVertexArray(0);
    graphicsDevice_->SetVertexBuffer(vertexBuffer);
}

void VertexBuffer::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("setData", SetData);
}

void VertexBuffer::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    try {
        auto graphicsDevice = helper.GetObject<GraphicsDevice>(args[0]);
        Handle<Array> array = Handle<Array>::Cast(args[1]);
        auto vertexDeclaration = new VertexDeclaration();
        for (int i = 0; i < array->Length(); i++) {
            auto obj = array->Get(i)->ToObject();
            auto name = helper.GetString(obj, "attributeName");
            auto type = helper.GetString(obj, "attributeType");
            if (type == "float") {
                vertexDeclaration->AddVertexElement(name, 1, 4);
            }
            else if (type == "vec2") {
                vertexDeclaration->AddVertexElement(name, 2, 8);
            }
            else if (type == "vec3") {
                vertexDeclaration->AddVertexElement(name, 3, 12);
            }
            else if (type == "vec4") {
                vertexDeclaration->AddVertexElement(name, 4, 16);
            }
        }
        auto vertexBuffer = new VertexBuffer(
                args.GetIsolate(), graphicsDevice, vertexDeclaration);
        args.GetReturnValue().Set(vertexBuffer->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void VertexBuffer::SetData(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    Handle<Array> array = Handle<Array>::Cast(args[0]);
    float *vertices = new float[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
        vertices[i] = (float) array->Get(i)->NumberValue();
    }

    auto usage = helper.GetString(args[1]);
    VertexBufferUsage bufferUsage = VertexBufferUsage::Static;
    if (usage == "dynamic") {
        bufferUsage = VertexBufferUsage::Dynamic;
    }

    auto self = GetInternalObject(args.Holder());
    self->SetData(vertices, sizeof(float) * array->Length(), bufferUsage);

    delete[] vertices;
}
