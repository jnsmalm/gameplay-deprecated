#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include <script/scriptobjecthelper.h>
#include "graphics-device.h"
#include "TextureCollection.h"
#include "VertexDeclaration.h"

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
    glBindVertexArray(vertexBuffer_->glVertexArray_);
    vertexBuffer_->getVertexDeclaration()->Apply(shaderProgram_);
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
    glfwSwapBuffers(window_->glfwWindow_);
}

void GraphicsDevice::SetShaderProgram(ShaderProgram *shaderProgram) {
    if (shaderProgram != nullptr && shaderProgram != shaderProgram_) {
        glUseProgram(shaderProgram->glShaderProgram_);
    }
    shaderProgram_ = shaderProgram;
}

void GraphicsDevice::SetSynchronizeWithVerticalRetrace(bool value) {
    glfwSwapInterval(value);
}

void GraphicsDevice::SetVertexBuffer(VertexBuffer *vertexBuffer) {
    if (vertexBuffer == nullptr) {
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }
    else if (vertexBuffer != vertexBuffer_) {
        glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer->glVertexBufferObject_);
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
