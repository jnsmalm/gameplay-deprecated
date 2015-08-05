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
#include <script/scriptobjecthelper.h>
#include "graphics-device.h"
#include "texture-collection.h"
#include "vertex-declaration.h"
#include "window.h"
#include "vertex-data-state.h"

using namespace v8;

namespace {

void SetVertexDataState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto vertexBuffer = helper.GetObject<VertexDataState>(args[0]);
    helper.GetObject<GraphicsDevice>(args.Holder())->
            SetVertexDataState(vertexBuffer);
}

void SetBlendState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto state = helper.GetString(args[0]);
    if (state == "additive") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetBlendState(BlendState::Additive);
    }
    else if (state == "alphaBlend") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetBlendState(BlendState::AlphaBlend);
    }
    else if (state == "opaque") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetBlendState(BlendState::Opaque);
    }
    else {
        ScriptEngine::current().ThrowTypeError(
                "Couldn't set blend state to '" + state + "'.");
    }
}

void SetDepthStencilState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto state = helper.GetString(args[0]);
    if (state == "default") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthStencilState(DepthStencilState::Default);
    }
    else if (state == "depthRead") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthStencilState(DepthStencilState::DepthRead);
    }
    else if (state == "none") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthStencilState(DepthStencilState::None);
    }
    else {
        ScriptEngine::current().ThrowTypeError(
                "Couldn't set depth stencil state to '" + state + "'.");
    }
}

}

GraphicsDevice::GraphicsDevice(Isolate *isolate, Window *window) :
        ScriptObjectWrap(isolate), textures_(isolate, this), window_(window) {
    textures_.InstallAsObject("textures", this->v8Object());
    SetBlendState(BlendState::Opaque);
    SetDepthStencilState(DepthStencilState::Default);
}

void GraphicsDevice::Clear(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GraphicsDevice::DrawVertices(PrimitiveType primitiveType,
                                    int startVertex, int primitiveCount) {
    if (vertexDataState_ == nullptr) {
        throw std::runtime_error(
                "Vertex data state must be set before drawing vertices.");
    }
    if (shaderProgram_ == nullptr) {
        throw std::runtime_error(
                "Shader program must be set before drawing vertices.");
    }
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
}

void GraphicsDevice::DrawElements(PrimitiveType primitiveType,
                                  int startIndex, int primitiveCount) {
    if (vertexDataState_ == nullptr) {
        throw std::runtime_error(
                "Vertex data state must be set before drawing elements.");
    }
    if (shaderProgram_ == nullptr) {
        throw std::runtime_error(
                "Shader program must be set before drawing elements.");
    }
    switch (primitiveType) {
        case PrimitiveType::TriangleList:
            glDrawElements(GL_TRIANGLES, primitiveCount * 3, GL_UNSIGNED_INT,
                           (void*)(startIndex * sizeof(GLuint)));
            break;
        case PrimitiveType::PointList:
            glDrawElements(GL_TRIANGLES, primitiveCount, GL_UNSIGNED_INT,
                           (void*)(startIndex * sizeof(GLuint)));
            break;
        case PrimitiveType::LineList:
            glDrawElements(GL_TRIANGLES, primitiveCount * 2, GL_UNSIGNED_INT,
                           (void*)(startIndex * sizeof(GLuint)));
            break;
    }
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
    if (texture == nullptr) {
        glBindTexture(GL_TEXTURE_2D, 0);
    }
    else {
        glBindTexture(GL_TEXTURE_2D, texture->glTexture());
    }
}

void GraphicsDevice::SetVertexDataState(VertexDataState *vertexDataState) {
    if (vertexDataState == nullptr) {
        glBindVertexArray(0);
    }
    else if (vertexDataState != vertexDataState_) {
        glBindVertexArray(vertexDataState->glVertexArray());
    }
    vertexDataState_ = vertexDataState;
}

void GraphicsDevice::SetBlendState(BlendState state) {
    switch (state) {
        case BlendState::Additive: {
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE);
            break;
        }
        case BlendState::AlphaBlend: {
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            break;
        }
        case BlendState::Opaque: {
            glDisable(GL_BLEND);
            break;
        }
    }
}

void GraphicsDevice::SetDepthStencilState(DepthStencilState state) {
    switch (state) {
        case DepthStencilState::Default: {
            glEnable(GL_DEPTH_TEST);
            glDepthMask(GL_TRUE);
            break;
        }
        case DepthStencilState::DepthRead: {
            glEnable(GL_DEPTH_TEST);
            glDepthMask(GL_FALSE);
            break;
        }
        case DepthStencilState::None: {
            glDisable(GL_DEPTH_TEST);
            glDepthMask(GL_FALSE);
            break;
        }
    }
}

void GraphicsDevice::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("clear", Clear);
    SetFunction("drawVertices", DrawVertices);
    SetFunction("drawElements", DrawElements);
    SetFunction("present", Present);
    SetFunction("setShaderProgram", SetShaderProgram);
    SetFunction("setSynchronizeWithVerticalRetrace",
                SetSynchronizeWithVerticalRetrace);
    SetFunction("setVertexDataState", ::SetVertexDataState);
    SetFunction("setBlendState", ::SetBlendState);
    SetFunction("setDepthStencilState", ::SetDepthStencilState);
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

void GraphicsDevice::DrawVertices(const FunctionCallbackInfo<Value> &args) {
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

    auto graphics = GetInternalObject(args.Holder());
    try {
        graphics->DrawVertices(primitive, vertexStart, primitiveCount);
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void GraphicsDevice::DrawElements(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptObjectHelper options(args.GetIsolate(), args[0]->ToObject());

    auto primitiveType = options.GetString("primitiveType");
    auto indexStart = options.GetInteger("indexStart");
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

    auto graphics = GetInternalObject(args.Holder());
    try {
        graphics->DrawElements(primitive, indexStart, primitiveCount);
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
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
