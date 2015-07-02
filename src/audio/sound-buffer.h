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

#ifndef JSPLAY_SOUNDBUFFER_H
#define JSPLAY_SOUNDBUFFER_H

#include <al/al.h>
#include <al/alc.h>
#include <script/script-object-wrap.h>
#include <v8.h>

class SoundBuffer : public ScriptObjectWrap<SoundBuffer> {

public:
    SoundBuffer(v8::Isolate *isolate, std::string filename);
    virtual ~SoundBuffer();

    static void New(const v8::FunctionCallbackInfo<v8::Value> &args);

    ALuint al_buffer() const {
        return al_buffer_;
    }

private:
    ALuint al_buffer_;
};

#endif //JSPLAY_SOUNDBUFFER_H
