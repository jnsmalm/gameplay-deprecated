#include <script/scriptobject.h>
#include <script/scriptengine.h>
#include <script/scripthelper.h>
#include "VertexBuffer.h"
#include "texture.h"

using namespace v8;

// Helps with setting up the script object.
class VertexBuffer::ScriptVertexBuffer : public ScriptObject<VertexBuffer> {

public:

    void Initialize() {
        ScriptObject::Initialize();
        AddFunction("bind", Bind);
        AddFunction("setData", SetData);
    }

    static void New(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        try {
            auto scriptObject = new ScriptVertexBuffer(args.GetIsolate());
            auto object = scriptObject->Wrap(new VertexBuffer());
            args.GetReturnValue().Set(object);
        }
        catch (std::exception& ex) {
            ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
        }
    }

    static void Bind(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto self = Unwrap<VertexBuffer>(args.Holder());
        self->Bind();
    }

    static void SetData(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        Handle<Array> array = Handle<Array>::Cast(args[0]);
        float vertices[array->Length()];
        for (int i = 0; i < array->Length(); i++) {
            vertices[i] = (float) array->Get(i)->NumberValue();
        }
        auto self = Unwrap<VertexBuffer>(args.Holder());
        self->SetData(vertices, sizeof(vertices));
    }

private:

    // Inherit constructors.
    using ScriptObject::ScriptObject;

};

VertexBuffer::VertexBuffer() {
    glGenBuffers(1, &glVertexBufferObject_);
}

VertexBuffer::~VertexBuffer() {
    glDeleteBuffers(1, &glVertexBufferObject_);
}

void VertexBuffer::Bind() {
    glBindBuffer(GL_ARRAY_BUFFER, glVertexBufferObject_);
}

void VertexBuffer::SetData(float *vertices, int size) {
    glBufferData(GL_ARRAY_BUFFER, size, vertices, GL_STREAM_DRAW);
}

void VertexBuffer::InstallScript(
    v8::Isolate *isolate, v8::Handle<v8::ObjectTemplate> global) {
    ScriptVertexBuffer::InstallAsConstructor<ScriptVertexBuffer>(
            isolate, "VertexBuffer", global);
}
