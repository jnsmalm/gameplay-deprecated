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

#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include <script/scriptobjecthelper.h>
#include "graphics-device.h"
#include "texture-collection.h"
#include "vertex-declaration.h"
#include "window.h"

using namespace v8;

GraphicsDevice::GraphicsDevice(Isolate *isolate, Window *window) :
        ObjectScript(isolate), textures_(isolate, this), window_(window) {
    textures_.InstallAsObject("textures", this->getObject());
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

void GraphicsDevice::Clear(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GraphicsDevice::DrawPrimitives(PrimitiveType primitiveType,
                                    int startVertex, int primitiveCount) {
    if (vertexBuffer_ == nullptr) {
        throw new std::runtime_error(
                "Vertex buffer must be set before drawing primitives");
    }
    if (shaderProgram_ == nullptr) {
        throw new std::runtime_error(
                "Shader program must be set before drawing primitives");
    }
    glBindVertexArray(vertexBuffer_->glVertexArray());
    vertexBuffer_->vertexDeclaration()->Apply(shaderProgram_);
    switch (primitiveType) {
        case PrimitiveType::TriangleList:
            glDrawArrays(GL_TRIANGLES, startVertex, primitiveCount * 3);
            break;
        case PrimitiveType::PointList:
            glDrawArrays(GL_POINTS, startVertex, primitiveCount);
            break;
        case PrimitiveType::LineList:
            glDrawArrays(GL_LINES, startVertex, primitiveCount * 2);
            break;
    }
    glBindVertexArray(0);
}

void GraphicsDevice::Present() {
    glfwSwapBuffers(window_->glfwWindow());
}

void GraphicsDevice::SetShaderProgram(ShaderProgram *shaderProgram) {
    if (shaderProgram != nullptr && shaderProgram != shaderProgram_) {
        glUseProgram(shaderProgram->glProgram());
    }
    shaderProgram_ = shaderProgram;
}

void GraphicsDevice::SetSynchronizeWithVerticalRetrace(bool value) {
    glfwSwapInterval(value);
}

void GraphicsDevice::SetTexture(int index, Texture2D* texture) {
    if (textures_[index] == texture) {
        return;
    }
    textures_[index] = texture;
    switch (index) {
        case 0:
            glActiveTexture(GL_TEXTURE0);
            break;
        case 1:
            glActiveTexture(GL_TEXTURE1);
            break;
        case 2:
            glActiveTexture(GL_TEXTURE2);
            break;
        case 3:
            glActiveTexture(GL_TEXTURE3);
            break;
        default:
            throw std::runtime_error("Unknown texture unit");
    }
    glBindTexture(GL_TEXTURE_2D, texture->glTexture());
}

void GraphicsDevice::SetVertexBuffer(VertexBuffer *vertexBuffer) {
    if (vertexBuffer == nullptr) {
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }
    else if (vertexBuffer != vertexBuffer_) {
        glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer->glVertexBuffer());
    }
    vertexBuffer_ = vertexBuffer;
}

void GraphicsDevice::Initialize() {
    ObjectScript::Initialize();
    SetFunction("clear", Clear);
    SetFunction("drawPrimitives", DrawPrimitives);
    SetFunction("present", Present);
    SetFunction("setShaderProgram", SetShaderProgram);
    SetFunction("setSynchronizeWithVerticalRetrace",
                SetSynchronizeWithVerticalRetrace);
    SetFunction("setVertexBuffer", SetVertexBuffer);
}

void GraphicsDevice::Clear(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptObjectHelper options(args.GetIsolate(), args[0]->ToObject());

    auto r = options.GetFloat("r");
    auto g = options.GetFloat("g");
    auto b = options.GetFloat("b");
    auto a = options.GetFloat("a");

    GetInternalObject(args.Holder())->Clear(r, g, b, a);
}

void GraphicsDevice::DrawPrimitives(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptObjectHelper options(args.GetIsolate(), args[0]->ToObject());

    auto primitiveType = options.GetString("primitiveType");
    auto vertexStart = options.GetInteger("vertexStart");
    auto primitiveCount = options.GetInteger("primitiveCount");

    PrimitiveType primitive;
    if (primitiveType == "triangleList") {
        primitive = PrimitiveType::TriangleList;
    }
    else if (primitiveType == "pointList") {
        primitive = PrimitiveType::PointList;
    }
    else if (primitiveType == "lineList") {
        primitive = PrimitiveType::LineList;
    }
    GetInternalObject(args.Holder())->DrawPrimitives(
            primitive, vertexStart, primitiveCount);
}

void GraphicsDevice::Present(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    GetInternalObject(args.Holder())->Present();
}

void GraphicsDevice::SetShaderProgram(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto shaderProgram = helper.GetObject<ShaderProgram>(args[0]);
    GetInternalObject(args.Holder())->SetShaderProgram(shaderProgram);
}

void GraphicsDevice::SetSynchronizeWithVerticalRetrace(
        const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto value = helper.GetBoolean(args[0]);
    GetInternalObject(args.Holder())->SetSynchronizeWithVerticalRetrace(value);
}

void GraphicsDevice::SetVertexBuffer(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto vertexBuffer = helper.GetObject<VertexBuffer>(args[0]);
    GetInternalObject(args.Holder())->SetVertexBuffer(vertexBuffer);
}
