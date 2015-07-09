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

#ifndef WINDOW_H
#define WINDOW_H

#include <gl/glew.h>
#include <glfw/glfw3.h>
#include "v8.h"
#include "graphics-device.h"
#include <string>
#include <script/script-object-wrap.h>

class Keyboard;
class Mouse;

class Window : public ScriptObjectWrap<Window> {

public:
    Window(v8::Isolate* isolate,
           std::string title, int width, int height, bool fullscreen);
    ~Window();

    void Close();
    static void EnsureCurrentContext();
    bool IsClosing();
    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    void SetTitle(std::string title);
    void PollEvents();

    GLFWwindow *glfwWindow() const {
        return glfwWindow_;
    }

    int width() const {
        return width_;
    }

    int height() const {
        return height_;
    }

protected:
    virtual void Initialize() override;

private:
    static void IsClosing(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void PollEvents(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void GetWidth(v8::Local<v8::String> name,
                         const v8::PropertyCallbackInfo<v8::Value>& args);
    static void GetHeight(v8::Local<v8::String> name,
                         const v8::PropertyCallbackInfo<v8::Value>& args);
    static void SetTitle(const v8::FunctionCallbackInfo<v8::Value>& args);

    GraphicsDevice* graphicsDevice_;
    GLFWwindow* glfwWindow_;
    int width_;
    int height_;
};


#endif