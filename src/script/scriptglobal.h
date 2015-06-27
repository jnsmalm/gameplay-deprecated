#ifndef SCRIPTGLOBAL_H
#define SCRIPTGLOBAL_H

#include <system/console.h>
#include "script/scripthelper.h"
#include "script/scriptengine.h"
#include "system/file.h"
#include "ObjectScript.h"

#include <graphics/sprite-font.h>
#include "audio/audio-manager.h"
#include "audio/sound-buffer.h"
#include "audio/sound-source.h"

#include "input/keyboard.h"
#include "graphics/shader-program.h"
#include "graphics/VertexBuffer.h"
#include "graphics/window.h"
#include "graphics/texture2d.h"

#include "v8.h"

class ScriptGlobal : public ObjectScript<ScriptGlobal> {

public:
    ScriptGlobal(v8::Isolate *isolate) :
            ObjectScript(isolate), console_(isolate), file_(isolate) {

        console_.InstallAsTemplate("console", getTemplate());
        file_.InstallAsTemplate("file", getTemplate());

        ObjectScript<Window>::InstallAsConstructor(
                isolate, "Window", getTemplate());
        ObjectScript<SpriteFont>::InstallAsConstructor(
                isolate, "SpriteFont", getTemplate());
        ObjectScript<Texture2D>::InstallAsConstructor(
                isolate, "Texture2D", getTemplate());
        ObjectScript<ShaderProgram>::InstallAsConstructor(
                isolate, "ShaderProgram", getTemplate());
        ObjectScript<VertexBuffer>::InstallAsConstructor(
                isolate, "VertexBuffer", getTemplate());
        ObjectScript<AudioManager>::InstallAsConstructor(
                isolate, "AudioManager", getTemplate());
        ObjectScript<SoundBuffer>::InstallAsConstructor(
                isolate, "SoundBuffer", getTemplate());
        ObjectScript<SoundSource>::InstallAsConstructor(
                isolate, "SoundSource", getTemplate());
    }

protected:
    void Initialize() override {
        ObjectScript::Initialize();
        SetFunction("require", Require);
    }

    static void Require(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::HandleScope scope(args.GetIsolate());
        ScriptHelper helper(args.GetIsolate());
        try {
            auto filename = helper.GetString(args[0]);
            auto result = ScriptEngine::GetCurrent().Execute(filename);
            args.GetReturnValue().Set(result);
        }
        catch (std::exception& ex) {
            ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
        }
    }

private:
    Console console_;
    File file_;
};

#endif