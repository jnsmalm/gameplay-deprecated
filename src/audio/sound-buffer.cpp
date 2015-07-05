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
#include <script/script-engine.h>
#include "sound-buffer.h"
#include "wave-format.h"

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
        ScriptObjectWrap(isolate){
    alGenBuffers((ALuint)1, &al_buffer_);
    WaveFormat waveFormat;
    waveFormat.Load(filename);
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
    auto filename = ScriptEngine::current().executionPath() +
            helper.GetString(args[0]);
    try {
        auto soundBuffer = new SoundBuffer(args.GetIsolate(), filename);
        args.GetReturnValue().Set(soundBuffer->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}