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

#ifndef JSPLAY_SCRIPTOBJECTHELPER_H
#define JSPLAY_SCRIPTOBJECTHELPER_H

#include <v8.h>
#include <string>

class ScriptObjectHelper {

public:
    ScriptObjectHelper(v8::Isolate *isolate) {
        v8_isolate_ = isolate;
        v8_object_ = v8::Object::New(isolate);
    }

    void SetInteger(std::string name, int value) {
        v8_object_->Set(v8::String::NewFromUtf8(v8_isolate_, name.c_str()),
                        v8::Integer::New(v8_isolate_, value));
    }

    void SetObject(std::string name, ScriptObjectHelper *value) {
        v8_object_->Set(v8::String::NewFromUtf8(v8_isolate_, name.c_str()),
                        value->v8_object());
    }

    v8::Handle<v8::Object> v8_object() {
        return v8_object_;
    }

private:
    v8::Handle<v8::Object> v8_object_;
    v8::Isolate *v8_isolate_;

};

#endif //JSPLAY_SCRIPTOBJECTHELPER_H
