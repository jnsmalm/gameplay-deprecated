#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "GraphicsDevice.h"
#include "TextureCollection.h"
#include "VertexDeclaration.h"

using namespace v8;

GraphicsDevice::GraphicsDevice(Isolate *isolate, Window *window) :
        ObjectScript(isolate) {
    textures_ = new TextureCollection(isolate, this);
    textures_->InstallAsObject("textures", this->getObject());
    window_ = window;

    //glEnable(GL_DEPTH_TEST);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    //glDepthFunc(GL_LEQUAL);
    //glDepthMask(GL_TRUE);
}

GraphicsDevice::~GraphicsDevice() {
    delete textures_;
}

void GraphicsDevice::Clear(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GraphicsDevice::DrawPrimitives(VertexBuffer* vertexBuffer,
                                    ShaderProgram* shaderProgram,
                                    PrimitiveT primitiveType, int startVertex,
                                    int primitiveCount) {


        SetVertexBuffer(vertexBuffer);
        SetShaderProgram(shaderProgram);
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
    for (int i = 0; i < 1; ++i) {
        switch (primitiveType) {
            case PrimitiveT::TriangleList:
                glDrawArrays(GL_TRIANGLES, startVertex, primitiveCount * 3);
                break;
            case PrimitiveT::PointList:
                glDrawArrays(GL_POINTS, startVertex, primitiveCount);
                break;
            case PrimitiveT::LineList:
                glDrawArrays(GL_LINES, startVertex, primitiveCount * 2);
                break;
        }
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
    this->shaderProgram_ = shaderProgram;
}

void GraphicsDevice::SetSynchronizeWithVerticalRetrace(bool value) {
    glfwSwapInterval(value);
}

void GraphicsDevice::SetTexture(Texture *texture, int unit) {
    switch (unit) {
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
    glBindTexture(GL_TEXTURE_2D, texture->glTexture_);
}

void GraphicsDevice::SetVertexBuffer(VertexBuffer *vertexBuffer) {
    if (vertexBuffer == nullptr) {
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }
    else if (vertexBuffer != this->vertexBuffer_) {
        glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer->glVertexBufferObject_);
        glBindVertexArray(vertexBuffer->glVertexArray_);
    }
    this->vertexBuffer_ = vertexBuffer;
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
    ScriptHelper helper(args.GetIsolate());

    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    auto arg = helper.GetObject(args[0]);
    auto r = helper.GetFloat(arg, "r");
    auto g = helper.GetFloat(arg, "g");
    auto b = helper.GetFloat(arg, "b");
    auto a = helper.GetFloat(arg, "a");

    self->Clear(r, g, b, a);
}

void GraphicsDevice::DrawPrimitives(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    auto arg = helper.GetObject(args[0]);
    auto primitiveType = helper.GetString(arg, "primitiveType");
    auto vertexStart = helper.GetInteger(arg, "vertexStart");
    auto primitiveCount = helper.GetInteger(arg, "primitiveCount");
    auto vertexBuffer = helper.GetObject<VertexBuffer>(arg, "vertexBuffer");
    auto shaderProgram = helper.GetObject<ShaderProgram>(arg, "shaderProgram");

    /*auto vertexBuffer = helper.GetObject<VertexBuffer>(args[0]);
    auto shaderProgram = helper.GetObject<ShaderProgram>(args[1]);
    auto primitiveType = helper.GetString(args[2]);
    auto vertexStart = helper.GetInteger(args[3]);
    auto primitiveCount = helper.GetInteger(args[4]);*/


    if (primitiveType == "triangleList") {
        self->DrawPrimitives(vertexBuffer, shaderProgram,
                             PrimitiveT::TriangleList, vertexStart,
                             primitiveCount);
    }
    else if (primitiveType == "pointList") {
        self->DrawPrimitives(vertexBuffer, shaderProgram,
                             PrimitiveT::PointList, vertexStart,
                             primitiveCount);
    }
    else if (primitiveType == "lineList") {
        self->DrawPrimitives(vertexBuffer, shaderProgram,
                             PrimitiveT::LineList, vertexStart,
                             primitiveCount);
    }
}

void GraphicsDevice::Present(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    self->Present();
}

void GraphicsDevice::SetShaderProgram(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto shaderProgram = helper.GetObject<ShaderProgram>(args[0]);
    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    self->SetShaderProgram(shaderProgram);
}

void GraphicsDevice::SetSynchronizeWithVerticalRetrace(
        const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto value = helper.GetBoolean(args[0]);
    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    self->SetSynchronizeWithVerticalRetrace(value);
}

void GraphicsDevice::SetVertexBuffer(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto vertexBuffer = helper.GetObject<VertexBuffer>(args[0]);
    auto self = ObjectScript<GraphicsDevice>::GetSelf(args.Holder());
    self->SetVertexBuffer(vertexBuffer);
}