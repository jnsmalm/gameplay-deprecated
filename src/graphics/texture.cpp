#include "graphics/texture.h"
#include "script/scriptengine.h"
#include "script/scriptobject.h"
#include "graphics/window.h"

#include "freeimage.h"
#include <vector>

using namespace v8;

// Helps with setting up the script object.
class Texture::ScriptTexture : public ScriptObject<ScriptTexture> {

public:

  void Setup()
  {
    AddAccessor("width", GetWidth);
    AddAccessor("height", GetHeight);
  }

  static void New(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(GetIsolate());
    try {
      auto filename = GetString(args[0]);
      filename = ScriptEngine::GetCurrent().GetCurrentScriptPath() + filename;
      auto object = Wrap(new Texture(filename));
      args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void GetWidth(
    Local<String> name, const PropertyCallbackInfo<Value>& args)
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Texture>(args.Holder());
    args.GetReturnValue().Set(self->GetWidth());
  }

  static void GetHeight(
    Local<String> name, const PropertyCallbackInfo<Value>& args)
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Texture>(args.Holder());
    args.GetReturnValue().Set(self->GetHeight());
  }

};

Texture::Texture(std::string filename)
{
  Window::EnsureCurrentContext();

  // Load the image for the texture.
  auto img = FreeImage_ConvertTo32Bits(
   FreeImage_Load(FreeImage_GetFileType(filename.c_str()), filename.c_str()));

  if (!img) {
    throw std::runtime_error("Failed to load image '" + filename + "'");
  }

  width_ = FreeImage_GetWidth(img);
  height_ = FreeImage_GetHeight(img);

  // Create a new texture.
  glGenTextures(1, &glTexture_);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, glTexture_);

  // Set texture filtering.
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

  // Set image data to the created texture.
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width_, height_, 0, GL_BGRA, 
    GL_UNSIGNED_BYTE, FreeImage_GetBits(img));

  FreeImage_Unload(img);
}

Texture::Texture(int width, int height, GLenum format)
{
  Window::EnsureCurrentContext();

  // Create a new texture.
  glGenTextures(1, &glTexture_);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, glTexture_);

  // Empty texture data.
  std::vector<GLubyte> emptyData(width * height * 4, 0);
  glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, 
    GL_UNSIGNED_BYTE, &emptyData[0]);

  width_ = width;
  height_ = height;
}

Texture::~Texture()
{
  glDeleteTextures(1, &glTexture_);
}

void Texture::Bind(int unit)
{
  switch (unit) {
    case 1:
      glActiveTexture(GL_TEXTURE1);
      break;
    case 2:
      glActiveTexture(GL_TEXTURE2);
      break;
    case 3:
      glActiveTexture(GL_TEXTURE3);
      break;
    default:
      glActiveTexture(GL_TEXTURE0);
  }
  glBindTexture(GL_TEXTURE_2D, glTexture_);
}

void Texture::Init(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptTexture::GetCurrent().Init(isolate, "Texture", parent);
}