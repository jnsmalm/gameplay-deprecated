/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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

#include "graphics/window.h"
#include "graphics-device.h"
#include <script/script-engine.h>
#include "script/scripthelper.h"
#include "input/mouse.h"
#include "input/keyboard.h"

using namespace v8;

Window::Window(Isolate* isolate, std::string title, int width, int height,
               bool fullscreen) : ScriptObjectWrap(isolate) {

    glfwSetErrorCallback([](int error, const char* description) {
        throw std::runtime_error(description);
    });

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);

    if (fullscreen && width == 0 && height == 0) {
        // Get current video mode to create a borderless full screen window.
        const GLFWvidmode* mode = glfwGetVideoMode(glfwGetPrimaryMonitor());
        glfwWindowHint(GLFW_RED_BITS, mode->redBits);
        glfwWindowHint(GLFW_GREEN_BITS, mode->greenBits);
        glfwWindowHint(GLFW_BLUE_BITS, mode->blueBits);
        glfwWindowHint(GLFW_REFRESH_RATE, mode->refreshRate);
        width = mode->width;
        height = mode->height;
    }

    GLFWmonitor* monitor = fullscreen ? glfwGetPrimaryMonitor() : 0;
    glfwWindow_ = glfwCreateWindow(width, height, title.c_str(), monitor, NULL);
    if (!glfwWindow_) {
        throw std::runtime_error("Failed to create window");
    }

    glfwSetFramebufferSizeCallback(
            glfwWindow_, [](GLFWwindow* window, int width, int height) {
        glViewport(0, 0, width, height);
    });

    if (monitor) {
        const GLFWvidmode* mode = glfwGetVideoMode(monitor);
        width_ = mode->width; height_ = mode->height;
    }
    else {
        glfwGetWindowSize(glfwWindow_, &width_, &height_);
    }

    glfwMakeContextCurrent(glfwWindow_);
    glfwSwapInterval(1);
    glViewport(0, 0, width_, height_);

    glewExperimental = GL_TRUE;
    if (glewInit() == GLEW_OK) {
        // GLEW has a problem with core contexts. It calls
        // glGetString(GL_EXTENSIONS)​, which causes GL_INVALID_ENUM on GL 3.2+
        // core context as soon as glewInit()​ is called.
        if (glGetError() != GL_INVALID_ENUM) {
            throw std::runtime_error("Failed to initialize glew");
        }
    }
    else {
        throw std::runtime_error("Failed to initialize glew");
    }

    graphicsDevice_ = new GraphicsDevice(isolate, this);
    graphicsDevice_->InstallAsObject("graphics", this->v8Object());
}

Window::~Window() {
    glfwDestroyWindow(glfwWindow_);
}

bool Window::IsClosing() {
    return glfwWindowShouldClose(glfwWindow_);
}

void Window::Close() {
    glfwSetWindowShouldClose(glfwWindow_, GL_TRUE);
}

void Window::PollEvents() {
    glfwPollEvents();
}

void Window::SetTitle(std::string title) {
    glfwSetWindowTitle(glfwWindow_, title.c_str());
}

void Window::EnsureCurrentContext() {
    if (!glfwGetCurrentContext()) {
        throw std::runtime_error("Window (OpenGL context) does not exist");
    }
}

void Window::Initialize() {
    ScriptObjectWrap::Initialize();
    SetFunction("close", Close);
    SetFunction("pollEvents", PollEvents);
    SetFunction("isClosing", IsClosing);
    SetAccessor("width", GetWidth, NULL);
    SetAccessor("height", GetHeight, NULL);
    SetFunction("setTitle", SetTitle);
}

void Window::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto arg = helper.GetObject(args[0]);
    auto title = helper.GetString(arg, "title", "");
    auto fullscreen = helper.GetBoolean(arg, "fullscreen", false);
    auto width = helper.GetInteger(arg, "width", fullscreen ? 0 : 1024);
    auto height = helper.GetInteger(arg, "height", fullscreen ? 0 : 576);

    try {
        auto window = new Window(
                args.GetIsolate(), title, width, height, fullscreen);
        args.GetReturnValue().Set(window->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void Window::Close(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    self->Close();
}

void Window::PollEvents(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    self->PollEvents();
}

void Window::IsClosing(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->IsClosing());
}

void Window::GetWidth(
        Local<String> name, const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->width());
}

void Window::GetHeight(
        Local<String> name, const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->height());
}

void Window::SetTitle(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto title = helper.GetString(args[0]);
    self->SetTitle(title);
}
