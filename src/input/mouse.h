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

#ifndef JSPLAY_MOUSE_H
#define JSPLAY_MOUSE_H

#include "v8.h"
#include <map>
#include <script/script-object-wrap.h>

class Window;

class Mouse : public ScriptObjectWrap<Mouse> {

public:
    Mouse(v8::Isolate *isolate, Window* window);

    bool IsButtonDown(int button);
    bool IsButtonPress(int button);
    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    void UpdateState();

    double x() const {
        return x_;
    }

    double y() const {
        return y_;
    }

protected:
    virtual void Initialize() override;

private:
    static void GetX(v8::Local<v8::String> name,
                     const v8::PropertyCallbackInfo<v8::Value> &args);
    static void GetY(v8::Local<v8::String> name,
                     const v8::PropertyCallbackInfo<v8::Value> &args);
    static void IsButtonDown(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void IsButtonPress(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void UpdateState(const v8::FunctionCallbackInfo<v8::Value>& args);

    double x_;
    double y_;
    std::map<int, int> oldState_;
    std::map<int, int> newState_;
    Window* window_;
};

#endif // JSPLAY_MOUSE_H