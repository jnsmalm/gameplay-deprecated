/*The MIT License (MIT)

opyright (c) 2015 Jens Malmborg

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

#ifndef GAMEPLAY_NUMBERARRAY_H
#define GAMEPLAY_NUMBERARRAY_H

#include "v8.h"
#include <script/script-object-wrap.h>
#include <vector>

class NumberArray : public ScriptObjectWrap<NumberArray> {

public:
    NumberArray(v8::Isolate* isolate, int size) :
            ScriptObjectWrap(isolate) {
        numbers_.reserve(size);
    }

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    void Push(double value) {
        numbers_.push_back(value);
    }

    void Clear() {
        numbers_.clear();
    }

    int Length() {
        return numbers_.size();
    }

    template <typename T>
    void copy(T* array) {
        std::copy(numbers_.begin(), numbers_.end(), array);
    }

protected:
    void Initialize() override;

private:
    std::vector<double> numbers_;

    static void Push(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Clear(const v8::FunctionCallbackInfo<v8::Value>& args);

};

#endif //GAMEPLAY_TIMER_H
