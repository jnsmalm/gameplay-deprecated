#ifndef SCRIPTGLOBAL_H
#define SCRIPTGLOBAL_H

#include <system/console.h>
#include "script/scripthelper.h"
#include <script/script-engine.h>
#include "system/file.h"

#include <graphics/sprite-font.h>
#include "audio/audio-manager.h"
#include "audio/sound-buffer.h"
#include "audio/sound-source.h"

#include "input/keyboard.h"
#include "input/mouse.h"
#include "graphics/shader-program.h"
#include "graphics/vertex-buffer.h"
#include "graphics/window.h"
#include "graphics/texture2d.h"

#include "v8.h"

class ScriptGlobal : public ScriptObjectWrap<ScriptGlobal> {

public:
    ScriptGlobal(v8::Isolate *isolate) :
            ScriptObjectWrap(isolate), console_(isolate), file_(isolate) {

        console_.InstallAsTemplate("console", v8Template());
        file_.InstallAsTemplate("file", v8Template());

        InstallConstructor<Window>("Window");
        InstallConstructor<SpriteFont>("SpriteFont");
        InstallConstructor<Texture2D>("Texture2D");
        InstallConstructor<ShaderProgram>("ShaderProgram");
        InstallConstructor<VertexBuffer>("VertexBuffer");
        InstallConstructor<Keyboard>("Keyboard");
        InstallConstructor<Mouse>("Mouse");
        InstallConstructor<AudioManager>("AudioManager");
        InstallConstructor<SoundBuffer>("SoundBuffer");
        InstallConstructor<SoundSource>("SoundSource");
    }

protected:
    void Initialize() override {
        ScriptObjectWrap::Initialize();
        SetFunction("require", Require);
    }

    template <typename T>
    void InstallConstructor(std::string name) {
        ScriptObjectWrap<T>::InstallAsConstructor(
                v8Isolate(), name, v8Template());
    }

private:
    static void Require(const v8::FunctionCallbackInfo<v8::Value>& args) {
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

    Console console_;
    File file_;
};

#endif