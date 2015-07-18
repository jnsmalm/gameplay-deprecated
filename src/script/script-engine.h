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

#ifndef JSPLAY_SCRIPTENGINE_H
#define JSPLAY_SCRIPTENGINE_H

#include "v8.h"
#include "libplatform/libplatform.h"
#include <string>
#include <vector>
#include <numeric>
#include <memory>

class ScriptGlobal;

class ScriptEngine {

public:
    v8::Handle<v8::Value> Execute(std::string filename);
    void Run(std::string filename, int argc, char* argv[]);
    void ThrowTypeError(std::string message);

    static ScriptEngine& current() {
        static ScriptEngine instance;
        return instance;
    }

    std::string executionPath() {
        return executionPath_;
    }

    std::string scriptPath() {
        if (scriptPath_.empty()) {
            return "";
        }
        return std::accumulate(scriptPath_.begin(), scriptPath_.end(),
                               std::string(""));
    }

private:
    ScriptEngine();
    ~ScriptEngine();

    ScriptEngine(ScriptEngine const& copy);
    ScriptEngine& operator=(ScriptEngine const& copy);

    v8::Platform* platform_;
    v8::Isolate* isolate_;
    std::unique_ptr<ScriptGlobal> global_;
    std::vector<std::string> scriptPath_;
    std::string executionPath_;
};

#endif