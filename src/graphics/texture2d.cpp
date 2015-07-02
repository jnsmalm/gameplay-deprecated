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

#include "texture2d.h"
#include "script/scriptengine.h"
#include "script/scripthelper.h"
#include "graphics/window.h"

#include <lodepng.h>
#include <vector>

using namespace v8;

Texture2D::Texture2D(Isolate* isolate, std::string filename) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    std::vector<unsigned char> image;
    unsigned width, height;
    auto error = lodepng::decode(image, width, height, filename);
    if (error) {
        throw std::runtime_error("Failed to load image '" + filename + "'");
    }
    width_ = width;
    height_ = height;

    glGenTextures(1, &glTexture_);
    glActiveTexture(GL_TEXTURE7);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width_, height_, 0, GL_RGBA,
                 GL_UNSIGNED_BYTE, &image[0]);
}

Texture2D::Texture2D(Isolate* isolate, int width, int height, GLenum format) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    std::vector<GLubyte> empty(width * height * 4, 0);
    glGenTextures(1, &glTexture_);
    glActiveTexture(GL_TEXTURE8);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format,
      GL_UNSIGNED_BYTE, &empty[0]);

    width_ = width;
    height_ = height;
}

Texture2D::~Texture2D() {
  glDeleteTextures(1, &glTexture_);
}

void Texture2D::Initialize() {
    ScriptObjectWrap::Initialize();
    SetAccessor("width", GetWidth, NULL);
    SetAccessor("height", GetHeight, NULL);
}

void Texture2D::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
                    helper.GetString(args[0]);
    try {
        auto texture = new Texture2D(args.GetIsolate(), filename);
        args.GetReturnValue().Set(texture->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void Texture2D::GetWidth(
        Local<String> name, const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->width());
}

void Texture2D::GetHeight(
        Local<String> name, const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    args.GetReturnValue().Set(self->height());
}