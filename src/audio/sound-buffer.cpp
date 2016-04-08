/*The MIT License (MIT)

Gameplay Copyright (c) 2016 Jens Malmborg

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
#include "stb_vorbis.c"

using namespace v8;

SoundBuffer::SoundBuffer(v8::Isolate *isolate, std::string filename) :
        ScriptObjectWrap(isolate) {

    int channels, rate;
    short* output;
    auto samples = stb_vorbis_decode_filename(
        filename.c_str(), &channels, &rate, &output);

    if (samples < 0)
    {
        throw std::runtime_error("Failed to load sound '" + filename + "'");
    }
    alGenBuffers((ALuint)1, &al_buffer_);
    auto format = AL_FORMAT_STEREO16;
    if (channels == 1)
    {
        format = AL_FORMAT_MONO16;
    }
    alBufferData(al_buffer_, format, output,
                 static_cast<ALsizei>(samples*channels*sizeof(short)), rate);
}

SoundBuffer::~SoundBuffer() {
    alDeleteBuffers(1, &al_buffer_);
}

void SoundBuffer::New(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::current().resolvePath(
            helper.GetString(args[0]));
    try {
        auto soundBuffer = new SoundBuffer(args.GetIsolate(), filename);
        args.GetReturnValue().Set(soundBuffer->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}