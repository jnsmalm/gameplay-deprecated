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

#include "file-reader.h"
#include "script/scripthelper.h"
#include <fstream>
#include <script/script-engine.h>

using namespace v8;

bool FileReader::Exists(std::string filename) {
    std::ifstream file(filename);
    if (file.good()) {
        file.close();
        return true;
    }
    return false;
}

std::string FileReader::ReadAsText(std::string filename) {
    std::ifstream in { filename };
    if (!in) {
      throw std::runtime_error("Failed to read file '" + filename + "'");
    }
    std::string contents((std::istreambuf_iterator<char>(in)),
                         std::istreambuf_iterator<char>());
    return contents;
}

void FileReader::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("readText", ReadText);
}

void FileReader::ReadText(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::current().executionPath() +
                    helper.GetString(args[0]);
    try {
        auto text = FileReader::ReadAsText(filename);
        args.GetReturnValue().Set(v8::String::NewFromUtf8(
                args.GetIsolate(), text.c_str()));
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}