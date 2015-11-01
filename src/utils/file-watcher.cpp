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

#include "file-watcher.h"
#include "script/scripthelper.h"
#include <fstream>
#include <script/script-engine.h>

using namespace v8;

namespace {

    void Start(const FunctionCallbackInfo<Value>& args) {
        auto dir = ScriptEngine::current().executionPath();
        FileWatcher::Start(dir);
    }

    void HandleEvents(const FunctionCallbackInfo<Value>& args) {
        FileWatcher::HandleEvents();
    }
}

class ScriptEventEventHandler : public FileWatcherEventHandler {

public:
    ScriptEventEventHandler(std::string filename, Isolate* isolate,
                            v8::Handle<Function> callback) :
            FileWatcherEventHandler(filename) {

        isolate_ = isolate;
        callback_.Reset(isolate, callback);
    }

    ~ScriptEventEventHandler() {
        callback_.Reset();
    }

    void Handle() {
        HandleScope scope(isolate_);
        auto callback = Local<Function>::New(isolate_, callback_);
        callback->Call(callback, 0, NULL);
    }

private:
    Isolate* isolate_;
    Persistent<Function> callback_;

};

void FileWatcher::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto filepath = ScriptEngine::current().resolvePath(
            helper.GetString(args[0]));
    auto callback = Handle<Function>::Cast(args[1]);
    auto eventHandler = new ScriptEventEventHandler(
            filepath, args.GetIsolate(), callback);

    try {
        auto watcher = new FileWatcher(args.GetIsolate(), eventHandler);
        args.GetReturnValue().Set(watcher->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void FileWatcher::InstallAsConstructor(
        v8::Isolate* isolate, std::string name,
        v8::Handle<v8::ObjectTemplate> objectTemplate) {

    ScriptObjectWrap::InstallAsConstructor(isolate, name, objectTemplate);
    SetConstructorFunction(isolate, "start", ::Start);
    SetConstructorFunction(isolate, "handleEvents", ::HandleEvents);
}

FileWatcherListener FileWatcher::_listener;
efsw::FileWatcher FileWatcher::_watcher;