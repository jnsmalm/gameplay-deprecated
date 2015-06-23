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

#include "input/keyboard.h"
#include "graphics/window.h"
#include <glfw/glfw3.h>

using namespace v8;

Keyboard::Keyboard(v8::Isolate *isolate, Window* window) :
        ObjectScript(isolate), window_(window) {
    // When sticky keys mode is enabled, the pollable state of a key will remain
    // GLFW_PRESS until the state of that key is polled with glfwGetKey. Once it
    // has been polled, if a key release event had been processed in the
    // meantime, the state will reset to GLFW_RELEASE, otherwise it will remain
    // GLFW_PRESS.
    glfwSetInputMode(window_->glfwWindow_, GLFW_STICKY_KEYS, 1);
}

bool Keyboard::IsKeyDown(int key)
{
    newKeyState_[key] = glfwGetKey(window_->glfwWindow_, key);
    return newKeyState_[key] == GLFW_PRESS;
}

bool Keyboard::IsKeyPress(int key)
{
    newKeyState_[key] = glfwGetKey(window_->glfwWindow_, key);
    return oldKeyState_[key] == GLFW_RELEASE && newKeyState_[key] == GLFW_PRESS;
}

void Keyboard::UpdateState()
{
    oldKeyState_ = newKeyState_;
}

void Keyboard::Initialize() {
    ObjectScript::Initialize();
    SetFunction("isKeyDown", IsKeyDown);
    SetFunction("isKeyPress", IsKeyPress);
}

void Keyboard::IsKeyDown(const FunctionCallbackInfo<Value>& args)
{
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->IsKeyDown(key);
    args.GetReturnValue().Set(value);
}

void Keyboard::IsKeyPress(const FunctionCallbackInfo<Value>& args)
{
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->IsKeyPress(key);
    args.GetReturnValue().Set(value);
}
