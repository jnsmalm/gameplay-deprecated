#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "GraphicsDevice.h"

using namespace v8;

// Helps with setting up the script object.
class GraphicsDevice::ScriptGraphicsDevice :
        public ScriptObject<GraphicsDevice> {

public:

    void Initialize() {
        ScriptObject::Initialize();
        AddFunction("clear", Clear);
        AddFunction("drawPrimitives", DrawPrimitives);
        AddFunction("present", Present);
        AddFunction("setShaderProgram", SetShaderProgram);
        AddFunction("setSynchronizeWithVerticalRetrace",
                    SetSynchronizeWithVerticalRetrace);
        AddFunction("setTexture", SetTexture);
        AddFunction("setVertexArray", SetVertexArray);
        AddFunction("setVertexBuffer", SetVertexBuffer);
    }

    static void Clear(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        auto arg = helper.GetObject(args[0]);
        auto r = helper.GetFloat(arg, "r");
        auto g = helper.GetFloat(arg, "g");
        auto b = helper.GetFloat(arg, "b");
        auto a = helper.GetFloat(arg, "a");
        self->Clear(r, g, b, a);
    }

    static void DrawPrimitives(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        auto arg = helper.GetObject(args[0]);
        auto primitiveType = helper.GetString(arg, "primitiveType");
        auto vertexStart = helper.GetInteger(arg, "vertexStart");
        auto primitiveCount = helper.GetInteger(arg, "primitiveCount");
        if (primitiveType == "triangleList")
            self->DrawPrimitives(PrimitiveT::TriangleList, vertexStart,
                                 primitiveCount);
        else if (primitiveType == "pointList")
            self->DrawPrimitives(PrimitiveT::PointList, vertexStart,
                                 primitiveCount);
        else if (primitiveType == "lineList")
            self->DrawPrimitives(PrimitiveT::LineList, vertexStart,
                                 primitiveCount);
    }

    static void Present(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->Present();
    }

    static void SetShaderProgram(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto shaderProgram = helper.GetObject<ShaderProgram>(args[0]);
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->SetShaderProgram(shaderProgram);
    }

    static void SetSynchronizeWithVerticalRetrace(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto value = helper.GetBoolean(args[0]);
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->SetSynchronizeWithVerticalRetrace(value);
    }

    static void SetTexture(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto texture = helper.GetObject<Texture>(args[0]);
        auto unit = helper.GetInteger(args[1]);
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->SetTexture(texture, unit);
    }

    static void SetVertexBuffer(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto vertexBuffer = helper.GetObject<VertexBuffer>(args[0]);
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->SetVertexBuffer(vertexBuffer);
    }

    static void SetVertexArray(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto vertexArray = helper.GetObject<VertexArray>(args[0]);
        auto self = Unwrap<GraphicsDevice>(args.Holder());
        self->SetVertexArray(vertexArray);
    }

private:

    // Inherit constructors.
    using ScriptObject::ScriptObject;

};

void GraphicsDevice::Clear(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GraphicsDevice::DrawPrimitives(PrimitiveT primitiveType, int startVertex,
                                    int primitiveCount) {
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

void GraphicsDevice::Present() {
    glfwSwapBuffers(window_->glfwWindow_);
}

void GraphicsDevice::SetShaderProgram(ShaderProgram *shaderProgram) {
    glUseProgram(shaderProgram->glShaderProgram_);
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

void GraphicsDevice::SetVertexArray(VertexArray *vertexArray) {
    glBindVertexArray(vertexArray->glVertexArray_);
}

void GraphicsDevice::SetVertexBuffer(VertexBuffer *vertexBuffer) {
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer->glVertexBufferObject_);
}

void GraphicsDevice::InstallScript(v8::Isolate *isolate,
                                   v8::Handle<v8::Object> parent) {
    ScriptGraphicsDevice::InstallAsProperty<ScriptGraphicsDevice>(
        isolate, "graphicsDevice", parent, this);
}
