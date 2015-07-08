/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

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

#include <graphics/window.h>
#include <graphics/sprite-font.h>
#include <audio/sound-buffer.h>
#include <audio/sound-source.h>
#include <input/keyboard.h>
#include <input/mouse.h>
#include "script-object-wrap.h"
#include "script-global.h"
#include "scripthelper.h"
#include "script-engine.h"

ScriptGlobal::ScriptGlobal(v8::Isolate *isolate) :
        ScriptObjectWrap(isolate), console_(isolate), fileReader_(isolate) {

    InstallConstructor<Window>("Window");
    InstallConstructor<SpriteFont>("SpriteFont");
    InstallConstructor<Texture2D>("Texture2D");
    InstallConstructor<ShaderProgram>("ShaderProgram");
    InstallConstructor<VertexBuffer>("VertexBuffer");
    InstallConstructor<Keyboard>("Keyboard");
    InstallConstructor<Mouse>("Mouse");
    InstallConstructor<SoundBuffer>("SoundBuffer");
    InstallConstructor<SoundSource>("SoundSource");

    console_.InstallAsTemplate("console", v8Template());
    fileReader_.InstallAsTemplate("file", v8Template());
}

void ScriptGlobal::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("require", Require);
}

void ScriptGlobal::Require(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    try {
        auto filename = helper.GetString(args[0]);
        auto result = ScriptEngine::current().Execute(filename);
        args.GetReturnValue().Set(result);
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}