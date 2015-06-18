//
// Created by Jens Malmborg on 16/06/15.
//

#include <script/scripthelper.h>
#include <script/scriptengine.h>
#include "soundbuffer.h"
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

SoundBuffer::SoundBuffer(v8::Isolate *isolate, std::string filename) :
        ObjectScript(isolate){
    alGenBuffers((ALuint)1, &al_buffer_);
    auto waveFormat = WaveFormat::Load(filename);
    auto audioFormat = GetAudioFormat(&waveFormat);
    alBufferData(al_buffer_, audioFormat, waveFormat.data,
                 waveFormat.subChunk2Size, waveFormat.sampleRate);
}

SoundBuffer::~SoundBuffer() {
    alDeleteBuffers(1, &al_buffer_);
}

void SoundBuffer::New(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
            helper.GetString(args[0]);
    try {
        auto soundBuffer = new SoundBuffer(args.GetIsolate(), filename);
        args.GetReturnValue().Set(soundBuffer->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}