//
// Created by Jens Malmborg on 16/06/15.
//

#ifndef JSPLAY_SOUNDBUFFER_H
#define JSPLAY_SOUNDBUFFER_H

#include <al/al.h>
#include <al/alc.h>
#include <script/ObjectScript.h>
#include <v8.h>

class SoundBuffer : public ObjectScript<SoundBuffer> {

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
