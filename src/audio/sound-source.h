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
#include <script/ObjectScript.h>
#include <v8.h>

class SoundBuffer;

class SoundSource : public ObjectScript<SoundSource> {

public:
    SoundSource(v8::Isolate *isolate, SoundBuffer *soundBuffer);
    virtual ~SoundSource();

    bool IsPlaying();
    static void New(const v8::FunctionCallbackInfo<v8::Value> &args);
    void Play();

private:
    virtual void Initialize() override;
    static void Play(const v8::FunctionCallbackInfo<v8::Value> &args);

    ALuint al_source_;
};

#endif //JSPLAY_SOUNDSOURCE_H
