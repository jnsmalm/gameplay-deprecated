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

#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "audio-manager.h"

using namespace v8;

AudioManager::AudioManager(v8::Isolate *isolate) : ScriptObjectWrap(isolate) {
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
        args.GetReturnValue().Set(audioManager->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}
