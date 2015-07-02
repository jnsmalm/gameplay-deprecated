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

#include "sound-source.h"
#include "sound-buffer.h"
#include <script/scriptengine.h>
#include <script/scripthelper.h>

using namespace v8;

SoundSource::SoundSource(Isolate *isolate, SoundBuffer *soundBuffer) :
        ScriptObjectWrap(isolate) {
    alGenSources((ALuint)1, &al_source_);
    alSourcef(al_source_, AL_PITCH, 1);
    alSourcef(al_source_, AL_GAIN, 1);
    alSource3f(al_source_, AL_POSITION, 0, 0, 0);
    alSource3f(al_source_, AL_VELOCITY, 0, 0, 0);
    alSourcei(al_source_, AL_LOOPING, AL_FALSE);
    alSourcei(al_source_, AL_BUFFER, soundBuffer->al_buffer());
}

SoundSource::~SoundSource() {
    alDeleteSources(1, &al_source_);
}

bool SoundSource::IsPlaying() {
    ALenum state;
    alGetSourcei(al_source_, AL_SOURCE_STATE, &state);
    return (state == AL_PLAYING);
}

void SoundSource::Play() {
    alSourcePlay(al_source_);
}

void SoundSource::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("play", Play);
}

void SoundSource::New(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    try {
        auto soundBuffer = helper.GetObject<SoundBuffer>(args[0]);
        auto soundSource = new SoundSource(args.GetIsolate(), soundBuffer);
        args.GetReturnValue().Set(soundSource->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void SoundSource::Play(const FunctionCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    auto soundSource = GetInternalObject(args.Holder());
    soundSource->Play();
}
