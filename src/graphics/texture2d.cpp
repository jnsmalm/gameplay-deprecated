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
#include <script/script-engine.h>
#include "script/scripthelper.h"
#include "graphics/window.h"
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

using namespace v8;

namespace
{
    GLenum GetTextureFormat(int channels) {
        switch (channels) {
            case 1: return GL_LUMINANCE;
            case 2: return GL_LUMINANCE_ALPHA;
            case 3: return GL_RGB;
            case 4: return GL_RGBA;
        }
    }

    GLint GetImageAlignment(int width, int channels) {
        if (width * channels % 4 == 0) {
            return 4;
        }
        else if (width * channels % 2 == 0) {
            return 2;
        }
        return 1;
    }
}

Texture2D::Texture2D(Isolate* isolate, std::string filename) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    int channels;
    unsigned char *image = stbi_load(
            filename.c_str(), &width_, &height_, &channels, 0);
    if (image == NULL) {
        throw std::runtime_error("Failed to load image '" + filename + "'");
    }

    // TODO: Add texture filtering to script

    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);

    glGenTextures(1, &glTexture_);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glPixelStorei(GL_UNPACK_ALIGNMENT, GetImageAlignment(width_, channels));
    glTexImage2D(GL_TEXTURE_2D, 0, GetTextureFormat(channels), width_, height_,
                 0, GetTextureFormat(channels), GL_UNSIGNED_BYTE, image);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 4);

    glBindTexture(GL_TEXTURE_2D, old_texture);

    stbi_image_free(image);
}

Texture2D::Texture2D(Isolate* isolate, int width, int height, GLenum format) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    std::vector<GLubyte> empty(width * height * 4, 0);

    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);
    glGenTextures(1, &glTexture_);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format,
                 GL_UNSIGNED_BYTE, &empty[0]);
    glBindTexture(GL_TEXTURE_2D, old_texture);

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
    auto filepath = ScriptEngine::current().resolvePath(
            helper.GetString(args[0]));
    try {
        auto texture = new Texture2D(args.GetIsolate(), filepath);
        args.GetReturnValue().Set(texture->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
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