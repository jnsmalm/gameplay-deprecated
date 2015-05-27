#include <script/scriptobject.h>
#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "VertexArray.h"

#include "v8.h"

using namespace v8;

// Helps with setting up the script object.
class VertexArray::ScriptVertexArray : public ScriptObject<VertexArray> {

public:

    void Initialize() {
        ScriptObject::Initialize();
        AddFunction("bind", Bind);
    }

    static void New(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        try {
            auto scriptObject = new ScriptVertexArray(args.GetIsolate());
            auto object = scriptObject->Wrap(new VertexArray());
            args.GetReturnValue().Set(object);
        }
        catch (std::exception& ex) {
            ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
        }
    }

    static void Bind(const FunctionCallbackInfo<Value>& args) {
        HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        auto self = Unwrap<VertexArray>(args.Holder());
        self->Bind();
    }

private:

    // Inherit constructors.
    using ScriptObject::ScriptObject;

};

VertexArray::VertexArray() {
    glGenVertexArrays(1, &glVertexArray_);
}

VertexArray::~VertexArray() {
    glDeleteVertexArrays(1, &glVertexArray_);
}

void VertexArray::Bind() {
    glBindVertexArray(glVertexArray_);
}

void VertexArray::InstallScript(
        v8::Isolate *isolate, v8::Handle<v8::ObjectTemplate> global) {
    ScriptVertexArray::InstallAsConstructor<ScriptVertexArray>(
            isolate, "VertexArray", global);
}