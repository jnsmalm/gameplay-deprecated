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

#include "texture2d.h"
#include <script/script-engine.h>
#include "script/scripthelper.h"
#include "graphics/window.h"
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

using namespace v8;

namespace {

void GetChannels(Local<String> name, const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = helper.GetObject<Texture2D>(args.Holder());
    args.GetReturnValue().Set(self->channels());
}

GLenum GetTextureFormat(int channels) {
    switch (channels) {
        case 1: return GL_LUMINANCE;
        case 2: return GL_LUMINANCE_ALPHA;
        case 3: return GL_RGB;
        case 4: return GL_RGBA;
        default:
            throw std::runtime_error("Texture2D: Unknown number of channels.");
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

void GetData(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto texture = helper.GetObject<Texture2D>(args.Holder());
    int size = texture->width() * texture->height() * texture->channels();
    float* pixels = new float[size];
    texture->GetData(pixels);

    auto array = v8::Array::New(args.GetIsolate(), size);
    for (uint32_t i=0; i<size; i++) {
        array->Set(i, v8::Number::New(args.GetIsolate(), pixels[i]));
    }
    delete[] pixels;

    args.GetReturnValue().Set(array);
}

void SetData(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto texture = helper.GetObject<Texture2D>(args.Holder());
    int size = texture->width() * texture->height() * texture->channels();

    std::vector<float> pixels;

    auto array = v8::Handle<v8::Array>::Cast(args[0]);
    for (int i=0; i<array->Length(); i++) {
        pixels.push_back(array->Get(i)->NumberValue());
    }

    texture->SetData(pixels);
}

void SetFilter(Local<String> name, Local<Value> value,
               const PropertyCallbackInfo<void>& args) {

    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto texture = helper.GetObject<Texture2D>(args.Holder());
    auto filter = helper.GetString(value);
    if (filter == "linear") {
        texture->SetFilter(TextureFilter::Linear);
    }
    else if (filter == "nearest") {
        texture->SetFilter(TextureFilter::Nearest);
    }
}

}

Texture2D::Texture2D(Isolate* isolate, std::string filename) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    unsigned char *image = stbi_load(
            filename.c_str(), &width_, &height_, &channels_, 0);
    if (image == NULL) {
        throw std::runtime_error("Failed to load image '" + filename + "'");
    }

    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);

    glGenTextures(1, &glTexture_);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glPixelStorei(GL_UNPACK_ALIGNMENT, GetImageAlignment(width_, channels_));
    glTexImage2D(GL_TEXTURE_2D, 0, GetTextureFormat(channels_), width_, height_,
                 0, GetTextureFormat(channels_), GL_UNSIGNED_BYTE, image);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 4);

    glBindTexture(GL_TEXTURE_2D, old_texture);

    glFormat_ = GetTextureFormat(channels_);
    glInternalFormat_ = GetTextureFormat(channels_);
    glType_ = GL_UNSIGNED_BYTE;

    stbi_image_free(image);
}

Texture2D::Texture2D(Isolate* isolate, int width, int height,
                     GLenum internalFormat, GLenum format, GLenum type) :
        ScriptObjectWrap(isolate) {

    Window::EnsureCurrentContext();

    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);
    glGenTextures(1, &glTexture_);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, width, height, 0, format,
                 type, 0);
    glBindTexture(GL_TEXTURE_2D, old_texture);

    glFormat_ = format;
    glInternalFormat_ = internalFormat;
    glType_ = type;
    width_ = width;
    height_ = height;
}

Texture2D::~Texture2D() {
    glDeleteTextures(1, &glTexture_);
}

void Texture2D::GetData(float* pixels) {
    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glPixelStorei(GL_PACK_ALIGNMENT, GetImageAlignment(width_, channels_));
    glGetTexImage(GL_TEXTURE_2D, 0,
                  GetTextureFormat(channels_), GL_FLOAT, pixels);
    glPixelStorei(GL_PACK_ALIGNMENT, 4);
    glBindTexture(GL_TEXTURE_2D, old_texture);
    assert(glGetError() == GL_NO_ERROR);
}

void Texture2D::SetData(std::vector<float> pixels) {
    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    glTexImage2D(GL_TEXTURE_2D, 0, glInternalFormat_, width_, height_, 0,
                 glFormat_, glType_, &pixels[0]);
    glBindTexture(GL_TEXTURE_2D, old_texture);
    assert(glGetError() == GL_NO_ERROR);
}

void Texture2D::SetFilter(TextureFilter filter) {
    GLint old_texture;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &old_texture);
    glBindTexture(GL_TEXTURE_2D, glTexture_);
    switch (filter) {
        case TextureFilter::Linear:
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
            break;
        case TextureFilter::Nearest:
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
            break;
    }
    glBindTexture(GL_TEXTURE_2D, old_texture);
}

void Texture2D::Initialize() {
    ScriptObjectWrap::Initialize();
    SetAccessor("channels", GetChannels, NULL);
    SetAccessor("width", GetWidth, NULL);
    SetAccessor("height", GetHeight, NULL);
    SetAccessor("filter", NULL, ::SetFilter);
    SetFunction("getData", ::GetData);
    SetFunction("setData", ::SetData);
}

void Texture2D::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    try {
        if (args[0]->IsString()) {
            auto filepath = ScriptEngine::current().resolvePath(
                    helper.GetString(args[0]));
            auto texture = new Texture2D(args.GetIsolate(), filepath);
            args.GetReturnValue().Set(texture->v8Object());
        } else {
            auto width = helper.GetInteger(args[0]);
            auto height = helper.GetInteger(args[1]);

            // Note that there is "internal format" and "format, type". GL will
            // convert from "format, type" to "internal format" as required.
            // You can give it RGBA data and tell it to use it as luminance if
            // you want; in that case it will use the R channel and ignore GBA
            auto options = helper.GetObject(args[2]);
            auto internalFormat =
                    helper.GetString(options, "internalFormat", "rgb");
            auto format = helper.GetString(options, "format", "rgb");

            GLenum glInternalFormat;
            if (internalFormat == "rgb") {
                glInternalFormat = GL_RGB;
            } else if (internalFormat == "rgb16f") {
                glInternalFormat = GL_RGB16F;
            } else if (internalFormat == "rgba16f") {
                glInternalFormat = GL_RGBA16F;
            } else if (internalFormat == "red") {
                glInternalFormat = GL_RED;
            } else {
                throw std::runtime_error("Texture2D: Unknown internal format.");
            }

            GLenum glFormat;
            if (format == "rgb") {
                glFormat = GL_RGB;
            } else if (format == "rgba") {
                glFormat = GL_RGBA;
            } else {
                throw std::runtime_error("Texture2D: Unknown format.");
            }

            auto texture = new Texture2D(
                    args.GetIsolate(), width, height, glInternalFormat,
                    glFormat, GL_FLOAT);
            args.GetReturnValue().Set(texture->v8Object());
        }
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
