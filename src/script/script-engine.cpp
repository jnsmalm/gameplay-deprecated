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

#include <utils/path-helper.h>
#include "script-engine.h"
#include "script-global.h"
#include "debug/debug-server.h"
#include <iostream>

using namespace v8;

namespace {

class ScriptModule : public ScriptObjectWrap<ScriptModule> {

public:
    ScriptModule(v8::Isolate* isolate, std::string path, std::string filename) :
            ScriptObjectWrap(isolate) {
        v8Object()->Set(v8::String::NewFromUtf8(isolate, "exports"),
                        v8::Object::New(isolate));
        v8Object()->Set(v8::String::NewFromUtf8(isolate, "path"),
                        v8::String::NewFromUtf8(isolate, path.c_str()));
        v8Object()->Set(v8::String::NewFromUtf8(isolate, "filename"),
                        v8::String::NewFromUtf8(isolate, filename.c_str()));
    }
};

class ArrayBufferAllocator : public ArrayBuffer::Allocator {

public:
    virtual void* Allocate(size_t length) {
        void* data = AllocateUninitialized(length);
        return data == NULL ? data : memset(data, 0, length);
    }

    virtual void* AllocateUninitialized(size_t length) {
        return malloc(length);
    }

    virtual void Free(void* data, size_t) {
        free(data);
    }
};

void PrintStackTrace(Isolate* isolate, TryCatch* tryCatch) {
    HandleScope scope(isolate);
    String::Utf8Value stackTrace(tryCatch->StackTrace());
    if (stackTrace.length() > 0) {
        std::cout << *stackTrace << std::endl;
    }
}

void PrintCompileError(Isolate* isolate, TryCatch* tryCatch) {
    HandleScope scope(isolate);
    Local<Message> message = tryCatch->Message();
    String::Utf8Value exception(tryCatch->Exception());
    String::Utf8Value filename(message->GetScriptOrigin().ResourceName());
    std::cout << *exception << std::endl << "    " << "at " << *filename <<
            ":" << message->GetLineNumber() << ":" <<
            message->GetStartColumn() << std::endl;
}

}

ScriptEngine::ScriptEngine() {
    V8::InitializeICU();
    platform_ = platform::CreateDefaultPlatform();
    V8::InitializePlatform(platform_);
    V8::Initialize();
}

ScriptEngine::~ScriptEngine() {
    V8::Dispose();
    V8::ShutdownPlatform();
    delete platform_;
}

void ScriptEngine::Run(std::string filename, int argc, char* argv[]) {
    V8::SetFlagsFromCommandLine(&argc, argv, true);

    executionPath_ = PathHelper::Append(
            {PathHelper::Current(), PathHelper::GetPath(filename)});

    filename = PathHelper::GetFileName(filename);

    bool debug = false;
    for (int i=1; i<argc; i++) {
        if (strcmp(argv[i], "debug") == 0) {
            debug = true;
        }
    }

    ArrayBufferAllocator array_buffer_allocator;
    Isolate::CreateParams create_params;
    create_params.array_buffer_allocator = &array_buffer_allocator;

    isolate_ = v8::Isolate::New(create_params);
    {
        Isolate::Scope isolate_scope(isolate_);
        HandleScope handle_scope(isolate_);
        global_.reset(new ScriptGlobal(isolate_));
        if (debug) {
            DebugServer::current().Start(isolate_);
        }
        context_ = Context::New(isolate_, NULL, global_->v8Template());
        Context::Scope context_scope(context_);
        Execute(filename);
    }
    isolate_->Dispose();
}

Handle<Value> ScriptEngine::Execute(std::string filepath) {
    EscapableHandleScope handle_scope(isolate_);

    if (!PathHelper::FileNameEndsWith(filepath, ".js")) {
        filepath += ".js";
    }

    auto filename = PathHelper::GetFileName(filepath);
    auto resolvedPath = resolvePath(filepath);

    // The original script source is being wrapped in an anonymous function
    // just to define a local scope.
    auto source = "(function (module, exports) { " +
            FileReader::ReadAsText(resolvedPath) + "\r\n});";

    auto script = String::NewFromUtf8(isolate_, source.c_str());

    TryCatch tryCatch;

    auto compiled = Script::Compile(
        script, String::NewFromUtf8(isolate_, resolvedPath.c_str()));

    if (compiled.IsEmpty()) {
        PrintCompileError(isolate_, &tryCatch);
        return v8::Null(isolate_);
    }

    if (filepath.compare(0, 2, "./") == 0) {
        filepath.erase(0, 2);
    }
    if (filepath.compare(0, 1, "/") == 0) {
        filepath.erase(0, 1);
    }
    auto p = PathHelper::GetPath(filepath);
    scriptPath_.push_back(p);

    // The result from the running script is a function that defines the local
    // scope for the script.
    auto result = compiled->Run();
    auto scope = Handle<Function>::Cast(result);

    // Create the current module for the script.
    auto module = new ScriptModule(isolate_, scriptPath(), filename);

    Handle<Value> args[] = { module->v8Object(), module->v8Object()->Get(
        v8::String::NewFromUtf8(isolate_, "exports")) };

    // Call the function that defines the local scope for the script (the module
    // is passed as an argument). An error has occurred when result is empty.
    if (scope->Call(scope, 2, args).IsEmpty()) {
        PrintStackTrace(isolate_, &tryCatch);
        scriptPath_.pop_back();
        return v8::Null(isolate_);
    }

    scriptPath_.pop_back();

    return handle_scope.Escape(
        module->v8Object()->Get(String::NewFromUtf8(isolate_, "exports")));
}

void ScriptEngine::ThrowTypeError(std::string message) {
    isolate_->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate_, message.c_str())));
}