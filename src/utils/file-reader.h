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

#ifndef JSPLAY_FILEREADER_H
#define JSPLAY_FILEREADER_H

#include "v8.h"
#include <string>
#include <script/script-object-wrap.h>

class FileReader : public ScriptObjectWrap<FileReader> {

public:
    FileReader(v8::Isolate *isolate) : ScriptObjectWrap(isolate) {}

    static bool Exists(std::string filename);
    static std::string ReadAsText(std::string filename);

protected:
    void Initialize() override;

private:
    static void ReadText(const v8::FunctionCallbackInfo<v8::Value>& args);
};

#endif // JSPLAY_FILEREADER_H