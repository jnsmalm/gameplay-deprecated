//
// Created by Jens Malmborg on 16/06/15.
//

#ifndef JSPLAY_AUDIOMANAGER_H
#define JSPLAY_AUDIOMANAGER_H

#include <al/al.h>
#include <al/alc.h>
#include <script/ObjectScript.h>
#include <v8.h>

class AudioManager : ObjectScript<AudioManager>
{
public:
    AudioManager(v8::Isolate *isolate);
    virtual ~AudioManager();

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    ALCcontext *context() const {
        return context_;
    }

private:
    ALCcontext *context_;
};


#endif //JSPLAY_AUDIOMANAGER_H
