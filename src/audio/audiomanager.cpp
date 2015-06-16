//
// Created by Jens Malmborg on 16/06/15.
//

#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "audiomanager.h"

using namespace v8;

AudioManager::AudioManager(v8::Isolate *isolate) : ObjectScript(isolate) {
    auto device = alcOpenDevice(NULL);
    if (!device) {
        throw std::runtime_error("Failed to initialize audio device");
    }
    context_ = alcCreateContext(device, NULL);
    if (!alcMakeContextCurrent(context_)) {
        throw std::runtime_error("Failed to initialize audio context");
    }
}

AudioManager::~AudioManager() {
    auto device = alcGetContextsDevice(context_);
    alcMakeContextCurrent(NULL);
    alcDestroyContext(context_);
    alcCloseDevice(device);
}

void AudioManager::New(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    try {
        auto audioManager = new AudioManager(args.GetIsolate());
        args.GetReturnValue().Set(audioManager->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}
