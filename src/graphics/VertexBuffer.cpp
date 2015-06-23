#include <script/scriptengine.h>
#include <script/scripthelper.h>
#include "VertexBuffer.h"
#include "window.h"
#include "VertexDeclaration.h"
#include "graphics-device.h"

using namespace v8;

VertexBuffer::VertexBuffer(v8::Isolate* isolate, GraphicsDevice* graphicsDevice,
                           VertexDeclaration* vertexDeclaration)
        : ObjectScript(isolate), graphicsDevice_(graphicsDevice),
          vertexDeclaration(vertexDeclaration) {
    Window::EnsureCurrentContext();
    glGenBuffers(1, &glVertexBufferObject_);
    glGenVertexArrays(1, &glVertexArray_);
}

VertexBuffer::~VertexBuffer() {
    glDeleteVertexArrays(1, &glVertexArray_);
    glDeleteBuffers(1, &glVertexBufferObject_);
}

void VertexBuffer::SetData(float *vertices, int size) {
    auto vertexBuffer = graphicsDevice_->vertexBuffer();
    graphicsDevice_->SetVertexBuffer(this);
    glBindVertexArray(glVertexArray_);
    glBufferData(GL_ARRAY_BUFFER, size, vertices, GL_STREAM_DRAW);
    glBindVertexArray(0);
    graphicsDevice_->SetVertexBuffer(vertexBuffer);
}

void VertexBuffer::Initialize() {
    ObjectScript::Initialize();
    SetFunction("setData", SetData);
}

void VertexBuffer::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    try {
        GraphicsDevice* graphicsDevice =
                helper.GetObject<GraphicsDevice>(args[0]);
        Handle<Array> array = Handle<Array>::Cast(args[1]);
        VertexDeclaration* vertexDeclaration = new VertexDeclaration();
        for (int i = 0; i < array->Length(); i++) {
            auto obj = array->Get(i)->ToObject();
            auto name = helper.GetString(obj, "attributeName");
            auto type = helper.GetString(obj, "attributeType");
            if (type == "float")
                vertexDeclaration->AddVertexElement(name, 1, 4);
            else if (type == "vec2")
                vertexDeclaration->AddVertexElement(name, 2, 8);
            else if (type == "vec3")
                vertexDeclaration->AddVertexElement(name, 3, 12);
            else if (type == "vec4")
                vertexDeclaration->AddVertexElement(name, 4, 16);
        }
        auto vertexBuffer = new VertexBuffer(
                args.GetIsolate(), graphicsDevice, vertexDeclaration);
        args.GetReturnValue().Set(vertexBuffer->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void VertexBuffer::SetData(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    Handle<Array> array = Handle<Array>::Cast(args[0]);
    float *vertices = new float[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
        vertices[i] = (float) array->Get(i)->NumberValue();
    }
    auto self = ObjectScript<VertexBuffer>::GetSelf(args.Holder());
    self->SetData(vertices, sizeof(float) * array->Length());
    delete vertices;
}
