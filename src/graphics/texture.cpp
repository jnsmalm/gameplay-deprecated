#include "graphics/texture.h"
#include "script/scriptengine.h"
#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "graphics/window.h"

#include <lodepng.h>
#include <vector>

using namespace v8;

Texture::Texture(Isolate* isolate, std::string filename) :
        ObjectScript(isolate) {
  Window::EnsureCurrentContext();

    std::vector<unsigned char> image; //the raw pixels
    unsigned width, height;

    //decode
    unsigned error = lodepng::decode(image, width, height, filename);

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

Texture::Texture(Isolate* isolate, int width, int height, GLenum format) :
        ObjectScript(isolate) {
  Window::EnsureCurrentContext();

  glGenTextures(1, &glTexture_);
  glActiveTexture(GL_TEXTURE8);
  glBindTexture(GL_TEXTURE_2D, glTexture_);

  std::vector<GLubyte> emptyData(width * height * 4, 0);
  glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, 
    GL_UNSIGNED_BYTE, &emptyData[0]);

  width_ = width;
  height_ = height;
}

Texture::~Texture() {
  glDeleteTextures(1, &glTexture_);
}

void Texture::Initialize() {
    ObjectScript::Initialize();
    SetAccessor("width", GetWidth, NULL);
    SetAccessor("height", GetHeight, NULL);
}

void Texture::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
                    helper.GetString(args[0]);
    try {
        auto texture = new Texture(args.GetIsolate(), filename);
        args.GetReturnValue().Set(texture->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void Texture::GetWidth(Local<String> name,
                       const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = ObjectScript<Texture>::GetSelf(args.Holder());
    auto b = args.Holder()->ToObject();
    auto c = helper.GetString(b->GetConstructorName());
    args.GetReturnValue().Set(self->GetWidth());
}

void Texture::GetHeight(Local<String> name,
                        const PropertyCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    auto self = ObjectScript<Texture>::GetSelf(args.Holder());
    args.GetReturnValue().Set(self->GetHeight());
}