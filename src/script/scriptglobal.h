#ifndef SCRIPTGLOBAL_H
#define SCRIPTGLOBAL_H

#include <system/console.h>
#include "script/scripthelper.h"
#include "script/scriptengine.h"
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

        ScriptObjectWrap<Window>::InstallAsConstructor(
                isolate, "Window", v8Template());
        ScriptObjectWrap<Keyboard>::InstallAsConstructor(
                isolate, "Keyboard", v8Template());
        ScriptObjectWrap<Mouse>::InstallAsConstructor(
                isolate, "Mouse", v8Template());
        ScriptObjectWrap<SpriteFont>::InstallAsConstructor(
                isolate, "SpriteFont", v8Template());
        ScriptObjectWrap<Texture2D>::InstallAsConstructor(
                isolate, "Texture2D", v8Template());
        ScriptObjectWrap<ShaderProgram>::InstallAsConstructor(
                isolate, "ShaderProgram", v8Template());
        ScriptObjectWrap<VertexBuffer>::InstallAsConstructor(
                isolate, "VertexBuffer", v8Template());
        ScriptObjectWrap<AudioManager>::InstallAsConstructor(
                isolate, "AudioManager", v8Template());
        ScriptObjectWrap<SoundBuffer>::InstallAsConstructor(
                isolate, "SoundBuffer", v8Template());
        ScriptObjectWrap<SoundSource>::InstallAsConstructor(
                isolate, "SoundSource", v8Template());
    }

protected:
    void Initialize() override {
        ScriptObjectWrap::Initialize();
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