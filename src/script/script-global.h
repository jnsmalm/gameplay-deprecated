/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

#ifndef GAMEPLAY_SCRIPTGLOBAL_H
#define GAMEPLAY_SCRIPTGLOBAL_H

#include <utils/console.h>
#include <utils/file-reader.h>
#include "script-object-wrap.h"
#include <map>

class ScriptGlobal : public ScriptObjectWrap<ScriptGlobal> {

public:
    ScriptGlobal(v8::Isolate *isolate);

protected:
    void Initialize() override;

private:
    template <typename T>
    void InstallConstructor(std::string name) {
        T::InstallAsConstructor(v8Isolate(), name, v8Template());
    }

    static void Require(const v8::FunctionCallbackInfo<v8::Value>& args);

    static std::map<std::string, v8::Persistent<v8::Value>> moduleCache;

    Console console_;
    FileReader fileReader_;
};

#endif