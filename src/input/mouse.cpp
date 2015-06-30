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

#include "input/mouse.h"
#include "graphics/window.h"
#include <gl/glew.h>
#include <glfw/glfw3.h>
#include <script/scripthelper.h>
#include <script/scriptengine.h>

using namespace v8;

Mouse::Mouse(Isolate *isolate, Window* window) : ObjectScript(isolate),
                                                 window_(window) {
    // Whenever you poll state, you risk missing the state change you are
    // looking for. If a pressed mouse button is released again before you poll
    // its state, you will have missed the button press. The recommended
    // solution for this is to use a mouse button callback, but there is also
    // the GLFW_STICKY_MOUSE_BUTTONS input mode.
    glfwSetInputMode(window_->glfwWindow(), GLFW_STICKY_MOUSE_BUTTONS, 1);
}

bool Mouse::IsButtonDown(int button) {
    newState_[button] = glfwGetMouseButton(window_->glfwWindow(), button);
    return newState_[button] == GLFW_PRESS;
}

bool Mouse::IsButtonPress(int button) {
    newState_[button] = glfwGetMouseButton(window_->glfwWindow(), button);
    return oldState_[button] == GLFW_RELEASE && newState_[button] == GLFW_PRESS;
}

void Mouse::UpdateState() {
    glfwGetCursorPos(window_->glfwWindow(), &x_, &y_);
    oldState_ = newState_;
}

void Mouse::Initialize() {
    ObjectScript::Initialize();
    SetAccessor("x", GetX, nullptr);
    SetAccessor("y", GetY, nullptr);
    SetFunction("isButtonDown", IsButtonDown);
    SetFunction("isButtonPress", IsButtonPress);
    SetFunction("updateState", UpdateState);
}

void Mouse::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto window = helper.GetObject<Window>(args[0]);
    try {
        auto mouse = new Mouse(args.GetIsolate(), window);
        args.GetReturnValue().Set(mouse->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void Mouse::GetX(Local<String> name, const PropertyCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->x());
}

void Mouse::GetY(Local<String> name, const PropertyCallbackInfo<Value> &args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->y());
}

void Mouse::IsButtonDown(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto button = args[0]->NumberValue();
    auto value = self->IsButtonDown(button);
    args.GetReturnValue().Set(value);
}

void Mouse::IsButtonPress(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto button = args[0]->NumberValue();
    auto value = self->IsButtonPress(button);
    args.GetReturnValue().Set(value);
}

void Mouse::UpdateState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    self->UpdateState();
}