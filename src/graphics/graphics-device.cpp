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
#include <script/scriptobjecthelper.h>
#include <iostream>
#include "graphics-device.h"
#include "window.h"
#include "vertex-specification.h"
#include "shader-program.h"
#include "texture2d.h"

using namespace v8;

namespace {

void SetVertexSpecification(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto vertexSpec = helper.GetObject<VertexSpecification>(args[0]);
    helper.GetObject<GraphicsDevice>(args.Holder())->
        SetVertexSpecification(vertexSpec);
}

void SetRenderTarget(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto graphicsDevice = helper.GetObject<GraphicsDevice>(args.Holder());
    if (args[0]->IsNull()) {
        graphicsDevice->SetRenderTarget(nullptr);
    }
    else {
        auto renderTarget = helper.GetObject<RenderTarget>(args[0]);
        graphicsDevice->SetRenderTarget(renderTarget);
    }
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

void SetDepthState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto state = helper.GetString(args[0]);
    if (state == "default") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthState(DepthState::Default);
    }
    else if (state == "read") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthState(DepthState::Read);
    }
    else if (state == "none") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetDepthState(DepthState::None);
    }
    else {
        ScriptEngine::current().ThrowTypeError(
                "Couldn't set depth state to '" + state + "'.");
    }
}

void SetStencilState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto state = helper.GetString(args[0]);
    if (state == "default") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetStencilState(StencilState::Default);
    }
    else if (state == "mask") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetStencilState(StencilState::Mask);
    }
    else if (state == "clip") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetStencilState(StencilState::Clip);
    }
    else {
        ScriptEngine::current().ThrowTypeError(
                "Couldn't set stencil state to '" + state + "'.");
    }
}

void SetRasterizerState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto state = helper.GetString(args[0]);
    if (state == "cullNone") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetRasterizerState(RasterizerState::CullNone);
    }
    else if (state == "cullClockwise") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetRasterizerState(RasterizerState::CullClockwise);
    }
    else if (state == "cullCounterClockwise") {
        helper.GetObject<GraphicsDevice>(args.Holder())->
                SetRasterizerState(RasterizerState::CullCounterClockwise);
    }
    else {
        ScriptEngine::current().ThrowTypeError(
                "Couldn't set rasterizer state to '" + state + "'.");
    }
}

}

GraphicsDevice::GraphicsDevice(Isolate *isolate, Window *window) :
        ScriptObjectWrap(isolate), textures_(isolate, this), window_(window) {

    textures_.InstallAsObject("textures", this->v8Object());
    SetBlendState(BlendState::Opaque);
    SetDepthState(DepthState::Default);
    SetStencilState(StencilState::Default);
    SetRasterizerState(RasterizerState::CullNone);
}

void GraphicsDevice::Clear(ClearType type, float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    switch (type) {
        case ClearType::Default:
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            break;
        case ClearType::Color:
            glClear(GL_COLOR_BUFFER_BIT);
            break;
        case ClearType::Depth:
            glClear(GL_DEPTH_BUFFER_BIT);
            break;
    }
}

void GraphicsDevice::DrawPrimitives(PrimitiveType primitiveType,
                                    int startVertex, int primitiveCount) {
    if (vertexSpec_ == nullptr) {
        throw std::runtime_error(
                "Vertex specification must be set before drawing primitives.");
    }
    if (shaderProgram_ == nullptr) {
        throw std::runtime_error(
                "Shader program must be set before drawing primitives.");
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

void GraphicsDevice::DrawIndexedPrimitives(PrimitiveType primitiveType,
                                           int startIndex, int primitiveCount) {
    if (vertexSpec_ == nullptr) {
        throw std::runtime_error(
                "Vertex specification must be set before drawing primitives.");
    }
    if (shaderProgram_ == nullptr) {
        throw std::runtime_error(
                "Shader program must be set before drawing primitives.");
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

void GraphicsDevice::SetVertexSpecification(VertexSpecification *vertexSpec) {
    if (vertexSpec == nullptr) {
        glBindVertexArray(0);
    }
    else if (vertexSpec != vertexSpec_) {
        glBindVertexArray(vertexSpec->glVertexArray());
    }
    vertexSpec_ = vertexSpec;
}

void GraphicsDevice::SetRenderTarget(RenderTarget *renderTarget) {
    if (renderTarget == nullptr) {
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
    else {
        glBindFramebuffer(GL_FRAMEBUFFER, renderTarget->framebuffer());
    }
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

void GraphicsDevice::SetDepthState(DepthState state) {
    switch (state) {
        case DepthState::Default: {
            glEnable(GL_DEPTH_TEST);
            glDepthMask(GL_TRUE);
            break;
        }
        case DepthState::Read: {
            glEnable(GL_DEPTH_TEST);
            glDepthMask(GL_FALSE);
            break;
        }
        case DepthState::None: {
            glDisable(GL_DEPTH_TEST);
            glDepthMask(GL_FALSE);
            break;
        }
    }
}

void GraphicsDevice::SetStencilState(StencilState state) {
    switch (state) {
        case StencilState::Default: {
            glDisable(GL_STENCIL_TEST);
            break;
        }
        case StencilState::Mask: {
            glEnable(GL_STENCIL_TEST);
            glStencilFunc(GL_ALWAYS, 1, 0xFF);
            glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
            glStencilMask(0xFF);
            glClear(GL_STENCIL_BUFFER_BIT);
            break;
        }
        case StencilState::Clip: {
            glEnable(GL_STENCIL_TEST);
            glStencilFunc(GL_EQUAL, 1, 0xFF);
            glStencilMask(0x00);
            break;
        }
    }
}

void GraphicsDevice::SetRasterizerState(RasterizerState state) {
    switch (state) {
        case RasterizerState::CullNone: {
            glDisable(GL_CULL_FACE);
            break;
        }
        case RasterizerState::CullClockwise: {
            glEnable(GL_CULL_FACE);
            glCullFace(GL_BACK);
            glFrontFace(GL_CCW);
            break;
        }
        case RasterizerState::CullCounterClockwise: {
            glEnable(GL_CULL_FACE);
            glCullFace(GL_BACK);
            glFrontFace(GL_CW);
            break;
        }
    }
}

void GraphicsDevice::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("clear", Clear);
    SetFunction("drawPrimitives", DrawPrimitives);
    SetFunction("drawIndexedPrimitives", DrawIndexedPrimitives);
    SetFunction("present", Present);
    SetFunction("setShaderProgram", SetShaderProgram);
    SetFunction("setSynchronizeWithVerticalRetrace",
                SetSynchronizeWithVerticalRetrace);
    SetFunction("setVertexSpecification", ::SetVertexSpecification);
    SetFunction("setRenderTarget", ::SetRenderTarget);
    SetFunction("setBlendState", ::SetBlendState);
    SetFunction("setDepthState", ::SetDepthState);
    SetFunction("setStencilState", ::SetStencilState);
    SetFunction("setRasterizerState", ::SetRasterizerState);
}

void GraphicsDevice::Clear(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto clearType = helper.GetString(args[0]);
    ClearType type = ClearType::Default;

    if (clearType == "color") {
        type = ClearType::Color;
    }
    else if (clearType == "depth") {
        type = ClearType::Depth;
    }

    v8::Handle<v8::Object> color;
    if (args[1]->IsObject()) {
        color = args[1]->ToObject();
    }
    else {
        color = v8::Object::New(args.GetIsolate());
    }

    ScriptObjectHelper options(args.GetIsolate(), color);

    auto r = options.GetFloat("r");
    auto g = options.GetFloat("g");
    auto b = options.GetFloat("b");
    auto a = options.GetFloat("a");

    GetInternalObject(args.Holder())->Clear(type, r, g, b, a);
}

void GraphicsDevice::DrawPrimitives(const FunctionCallbackInfo<Value> &args) {
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
        graphics->DrawPrimitives(primitive, vertexStart, primitiveCount);
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void GraphicsDevice::DrawIndexedPrimitives(
        const FunctionCallbackInfo<Value> &args) {
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
        graphics->DrawIndexedPrimitives(primitive, indexStart, primitiveCount);
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