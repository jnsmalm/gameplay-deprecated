//
// Created by Jens Malmborg on 16/06/15.
//

#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "soundeffect.h"
#include "waveformat.h"

using namespace v8;

namespace {
    ALenum GetAudioFormat(WaveFormat *waveFormat) {
        switch (waveFormat->bitsPerSample) {
            case 16:
                if (waveFormat->numChannels > 1)
                    return AL_FORMAT_STEREO16;
                else
                    return AL_FORMAT_MONO16;
            case 8:
                if (waveFormat->numChannels > 1)
                    return AL_FORMAT_STEREO8;
                else
                    return AL_FORMAT_MONO8;
            default:
                return -1;
        }
    }
}

SoundEffect::SoundEffect(v8::Isolate *isolate, std::string filename) :
        ObjectScript(isolate){
    alGenSources((ALuint)1, &source_);
    alSourcef(source_, AL_PITCH, 1);
    alSourcef(source_, AL_GAIN, 1);
    alSource3f(source_, AL_POSITION, 0, 0, 0);
    alSource3f(source_, AL_VELOCITY, 0, 0, 0);
    alSourcei(source_, AL_LOOPING, AL_FALSE);
    alGenBuffers((ALuint)1, &buffer_);
    auto waveFormat = WaveFormat::Load(filename);
    auto audioFormat = GetAudioFormat(&waveFormat);
    alBufferData(buffer_, audioFormat, waveFormat.data,
                 waveFormat.subChunk2Size, waveFormat.sampleRate);
    alSourcei(source_, AL_BUFFER, buffer_);
}

SoundEffect::~SoundEffect() {
    alDeleteSources(1, &source_);
    alDeleteBuffers(1, &buffer_);
}

void SoundEffect::Play() {
    alSourcePlay(source_);
}

void SoundEffect::Initialize() {
    ObjectScript::Initialize();
    SetFunction("play", Play);
}

void SoundEffect::New(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
            helper.GetString(args[0]);
    try {
        auto soundEffect = new SoundEffect(args.GetIsolate(), filename);
        args.GetReturnValue().Set(soundEffect->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void SoundEffect::Play(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    auto soundEffect = GetSelf(args.Holder());
    soundEffect->Play();
}