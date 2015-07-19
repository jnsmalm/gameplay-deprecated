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
#include <script/script-engine.h>

using namespace v8;

Mouse::Mouse(Isolate *isolate, Window* window) : ScriptObjectWrap(isolate),
                                                 window_(window) {
    // Whenever you poll state, you risk missing the state change you are
    // looking for. If a pressed mouse button is released again before you poll
    // its state, you will have missed the button press. The recommended
    // solution for this is to use a mouse button callback, but there is also
    // the GLFW_STICKY_MOUSE_BUTTONS input mode.
    glfwSetInputMode(window_->glfwWindow(), GLFW_STICKY_MOUSE_BUTTONS, 1);
}

bool Mouse::IsButtonDown(MouseButton button) {
    int btn = 0;
    switch (button) {
        case MouseButton::Left: {
            btn = 0;
            break;
        }
        case MouseButton::Right: {
            btn = 1;
            break;
        }
    }
    newState_[btn] = glfwGetMouseButton(window_->glfwWindow(), btn);
    return newState_[btn] == GLFW_PRESS;
}

bool Mouse::IsButtonPress(MouseButton button) {
    int btn = 0;
    switch (button) {
        case MouseButton::Left: {
            btn = 0;
            break;
        }
        case MouseButton::Right: {
            btn = 1;
            break;
        }
    }
    newState_[btn] = glfwGetMouseButton(window_->glfwWindow(), btn);
    return oldState_[btn] == GLFW_RELEASE && newState_[btn] == GLFW_PRESS;
}

void Mouse::UpdateState() {
    int offset_x = 0, offset_y = 0;
    if (glfwGetWindowMonitor(window_->glfwWindow()) != NULL) {
        glfwGetWindowPos(window_->glfwWindow(), &offset_x, &offset_y);
    }
    glfwGetCursorPos(window_->glfwWindow(), &x_, &y_);
    x_ += offset_x;
    y_ += offset_y;
    oldState_ = newState_;
}

void Mouse::Initialize() {
    ScriptObjectWrap::Initialize();
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
        args.GetReturnValue().Set(mouse->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
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
    ScriptHelper helper(args.GetIsolate());

    auto self = GetInternalObject(args.Holder());
    auto button = helper.GetString(args[0]);
    bool result = false;

    if (button == "left") {
        result = self->IsButtonDown(MouseButton::Left);
    }
    if (button == "right") {
        result = self->IsButtonDown(MouseButton::Right);
    }

    args.GetReturnValue().Set(result);
}

void Mouse::IsButtonPress(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto self = GetInternalObject(args.Holder());
    auto button = helper.GetString(args[0]);
    bool result = false;

    if (button == "left") {
        result = self->IsButtonPress(MouseButton::Left);
    }
    if (button == "right") {
        result = self->IsButtonPress(MouseButton::Right);
    }

    args.GetReturnValue().Set(result);
}

void Mouse::UpdateState(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    self->UpdateState();
}