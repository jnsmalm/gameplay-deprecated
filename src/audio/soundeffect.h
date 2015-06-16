//
// Created by Jens Malmborg on 16/06/15.
//

#ifndef JSPLAY_SOUNDEFFECT_H
#define JSPLAY_SOUNDEFFECT_H

#include <al/al.h>
#include <al/alc.h>
#include <script/ObjectScript.h>
#include <v8.h>

class SoundEffect : ObjectScript<SoundEffect> {

public:
    SoundEffect(v8::Isolate *isolate, std::string filename);
    virtual ~SoundEffect();

    static void New(const v8::FunctionCallbackInfo<v8::Value> &args);
    void Play();

private:

    virtual void Initialize() override;

    static void Play(const v8::FunctionCallbackInfo<v8::Value> &args);

    ALuint source_;
    ALuint buffer_;
};

#endif //JSPLAY_SOUNDEFFECT_H
