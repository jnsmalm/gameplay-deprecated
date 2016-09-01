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

#ifndef JSPLAY_SOUNDSOURCE_H
#define JSPLAY_SOUNDSOURCE_H

#include <al/al.h>
#include <script/script-object-wrap.h>
#include <v8.h>

class SoundBuffer;

enum class SoundState {
    Unknown,
    Initial,
    Playing,
    Paused,
    Stopped
};

class SoundSource : public ScriptObjectWrap<SoundSource> {

public:
    SoundSource(v8::Isolate *isolate, SoundBuffer *soundBuffer);
    virtual ~SoundSource();

    static void New(const v8::FunctionCallbackInfo<v8::Value> &args);
    void Pause();
    void Play();
    void Stop();
    SoundState GetState();

    float volume() {
        ALfloat value;
        alGetSourcef(al_source_, AL_GAIN, &value);
        return static_cast<float>(value);
    }

    void volume(float value) {
        if (value < 0) {
            value = 0;
        }
        else if (value > 1) {
            value = 1;
        }
        alSourcef(al_source_, AL_GAIN, static_cast<ALfloat>(value));
    }

    bool loop() {
        ALint value;
        alGetSourcei(al_source_, AL_LOOPING, &value);
        return static_cast<bool>(value);
    }

    void loop(bool value) {
        alSourcei(al_source_, AL_LOOPING, static_cast<ALint>(value));
    }

protected:
    void Initialize() override;

private:
    static void Pause(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void Play(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void Stop(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void GetState(v8::Local<v8::String> name,
                         const v8::PropertyCallbackInfo<v8::Value>& args);
    static void GetVolume(v8::Local<v8::String> name,
                          const v8::PropertyCallbackInfo<v8::Value>& args);
    static void SetVolume(v8::Local<v8::String> name,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void>& args);
    static void GetLoop(v8::Local<v8::String> name,
                        const v8::PropertyCallbackInfo<v8::Value>& args);
    static void SetLoop(v8::Local<v8::String> name,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void>& args);

    ALuint al_source_;
};

#endif //JSPLAY_SOUNDSOURCE_H
